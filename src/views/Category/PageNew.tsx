import "./scss/index.scss";

import * as React from "react";
import { useIntl } from "react-intl";
import { find } from "lodash";
import { Fab } from "react-tiny-fab";
import "react-tiny-fab/dist/styles.css";

import { demoMode } from "@temp/constants";
import { IFilterAttributes, IFilters } from "@types";
import { ProductListHeader } from "@components/molecules";
import { useEffect, useState } from "react";
import { Loader } from "@components/atoms";
import { Category_category } from "@temp/views/Category/gqlTypes/Category";
import { commonMessages } from "@temp/intl";
import {
  Breadcrumbs,
  extractBreadcrumbs,
  MainMenu,
  ProductsFeatured,
} from "../../components";

import { FilterSidebar, ProductList } from "../../@next/components/organisms";
import { TypedMainMenuQuery } from "../../components/MainMenu/queries";

import {
  convertSortByFromString,
  convertToAttributeScalar,
  getGraphqlIdFromDBId,
  maybe,
} from "../../core/utils";

import { CategoryProducts_products } from "./gqlTypes/CategoryProducts";

interface SortItem {
  label: string;
  value?: string;
}

interface SortOptions extends Array<SortItem> {}

interface PageProps {
  products: CategoryProducts_products;
  activeSortOption: string;
  activeFilters: number;
  filters: IFilters;
  clearFilters: () => void;
  sortOptions: SortOptions;
  onOrder: (order: { value?: string; label: string }) => void;
  onAttributeFiltersChange: (attributeSlug: string, value: string) => void;
  attributes: IFilterAttributes[];
  match: any;
  onLoadMore: () => void;
  displayLoader: boolean;
  category: Category_category;
  onRefresh: () => void;
}

const Page: React.FC<PageProps> = ({
  products,
  activeSortOption,
  activeFilters,
  filters,
  clearFilters,
  sortOptions,
  onOrder,
  onAttributeFiltersChange,
  attributes,
  match,
  onLoadMore,
  displayLoader,
  category,
  onRefresh,
}) => {
  const [attributesFetched, setAttributesFetched] = useState(false);
  const [attributesData, setAttributesData] = useState();
  const API_URL = process.env.API_URI || "/graphql/";

  const variables = {
    ...filters,
    attributes: filters.attributes
      ? convertToAttributeScalar(filters.attributes)
      : {},
    id: getGraphqlIdFromDBId(match.params.id, "Category"),
    sortBy: convertSortByFromString(filters.sortBy),
  };

  variables.pageSize = 1000;

  const canDisplayProducts = maybe(
    () =>
      // @ts-ignore
      !!products.products.edges && products.products.totalCount !== undefined
  );
  // const hasProducts = canDisplayProducts && !!products.totalCount;
  const intl = useIntl();
  const [showFilters, setShowFilters] = React.useState(false);

  const getAttribute = (attributeSlug: string, valueSlug: string) => {
    if (attributesData) {
      return {
        attributeSlug,
        // @ts-ignore
        valueName: attributesData.attributes.edges
          .map(edge => edge.node)
          .find(({ slug }) => attributeSlug === slug)
          .values.find(({ slug }) => valueSlug === slug).name,
        valueSlug,
      };
    }
  };

  const activeFiltersAttributes =
    filters &&
    filters.attributes &&
    Object.keys(filters.attributes).reduce(
      (acc, key) =>
        acc.concat(
          filters.attributes[key].map(valueSlug => getAttribute(key, valueSlug))
        ),
      []
    );

  const queryAttrributesData = async () => {
    const query = JSON.stringify({
      query: `
      query Category($id: ID!) {
    category(id: $id) {
      seoDescription
      seoTitle
      id
      name
      backgroundImage {
        url
      }
      ancestors(last: 5) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
    attributes(
      filter: { inCategory: $id, filterableInStorefront: true }
      first: 100
    ) {
      edges {
        node {
          id
          name
          slug
          values {
            id
            name
            slug
          }
        }
      }
    }
  }
    `,
      variables,
    });

    const response = await fetch(API_URL, {
      headers: { "content-type": "application/json" },
      method: "POST",
      body: query,
    });

    const responseJson = await response.json();
    return responseJson.data;
  };

  const fetchAttributes = async () => {
    const res = await queryAttrributesData();
    setAttributesData(res);
  };

  useEffect(() => {
    let mounted = true;
    fetchAttributes().then(r => {
      if (mounted) {
        setAttributesFetched(true);
        console.log("fetched");
      }
    });
    // eslint-disable-next-line no-return-assign
    return () => (mounted = false);
  }, [attributesFetched]);

  // console.log(products.products.edges[0].node);

  if (!attributesFetched) {
    return (
      <>
        <MainMenu demoMode={demoMode} whichMenu="fullPage" />
        <div className="category">
          <div className="container">
            <Loader />
            <ProductListHeader
              activeSortOption={activeSortOption}
              openFiltersMenu={() => setShowFilters(true)}
              // @ts-ignore
              numberOfProducts={products ? products.products.totalCount : 0}
              activeFilters={activeFilters}
              clearFilters={clearFilters}
              sortOptions={sortOptions}
              onChange={onOrder}
              onCloseFilterAttribute={onAttributeFiltersChange}
            />
            {canDisplayProducts && (
              <ProductList
                // @ts-ignore
                products={products.products.edges.map(edge => edge.node)}
                // @ts-ignore
                canLoadMore={products.products?.pageInfo.hasNextPage}
                loading={displayLoader}
                onLoadMore={onLoadMore}
              />
            )}
          </div>
          <ProductsFeatured
            title={intl.formatMessage(commonMessages.youMightLike)}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <TypedMainMenuQuery renderOnError displayLoader={false}>
        {({ data }) => {
          const items = maybe(() => data.shop.navigation.main.items, []);
          // @ts-ignore
          const categoryData = find(items, function (item) {
            // @ts-ignore
            return item.category.id === category.id;
          });

          return (
            <>
              <Fab
                mainButtonStyles={{
                  backgroundColor: "#E43024",
                }}
                style={{
                  bottom: 50,
                  right: "10%",
                }}
                icon="&uarr;"
                event="click"
                key={-1}
                alwaysShowTitle={false}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                text="Back to top"
              />

              <MainMenu demoMode={demoMode} whichMenu="fullPage" />
              <div className="category">
                <div className="container">
                  <>
                    <Breadcrumbs breadcrumbs={extractBreadcrumbs(category)} />
                    <FilterSidebar
                      show={showFilters}
                      hide={() => setShowFilters(false)}
                      onAttributeFiltersChange={onAttributeFiltersChange}
                      // @ts-ignore
                      attributes={attributesData.attributes.edges.map(
                        edge => edge.node
                      )}
                      filters={filters}
                      // @ts-ignore
                      products={products.products.edges.map(edge => edge.node)}
                      category={categoryData}
                    />

                    <ProductListHeader
                      activeSortOption={activeSortOption}
                      openFiltersMenu={() => setShowFilters(true)}
                      numberOfProducts={
                        // @ts-ignore
                        products ? products.products.totalCount : 0
                      }
                      activeFilters={activeFilters}
                      activeFiltersAttributes={activeFiltersAttributes}
                      clearFilters={clearFilters}
                      sortOptions={sortOptions}
                      onChange={onOrder}
                      onCloseFilterAttribute={onAttributeFiltersChange}
                    />
                    {canDisplayProducts && (
                      <ProductList
                        // @ts-ignore
                        products={products.products.edges.map(
                          edge => edge.node
                        )}
                        // @ts-ignore
                        canLoadMore={products.products?.pageInfo.hasNextPage}
                        loading={displayLoader}
                        onLoadMore={onLoadMore}
                      />
                    )}
                  </>
                </div>
                <ProductsFeatured
                  title={intl.formatMessage(commonMessages.youMightLike)}
                />
              </div>
            </>
          );
        }}
      </TypedMainMenuQuery>
    </>
  );
};

export default Page;
