import * as React from "react";
// import { RouteComponentProps, withRouter } from "react-router-dom";

import algoliasearch from "algoliasearch/lite";
import {
  Hits,
  InstantSearch,
  SearchBox,
  connectStateResults,
} from "react-instantsearch-dom";

interface SearchState {
  search: string;
}

const Results = connectStateResults(({ searchState }) =>
  searchState && searchState.query ? (
    <>
      <Hits hitComponent={Hit} />
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex,jsx-a11y/tabindex-no-positive */}
      <div id="search-dummy" tabIndex={1} />
    </>
  ) : // <div>No query</div>
  null
);

const Hit = hit => {
  const result = hit.hit;
  return (
    <a href={`/product/${result.slug}/${result.objectID}`}>
      {!!result.image && (
        <img
          src={result.image}
          style={{ height: 100, width: 100 }}
          alt={result.name}
        />
      )}
      <p>{result.name}</p>
    </a>
  );
};

// @ts-ignore
export default class AlgoliaSearch extends React.Component<SearchState> {
  // eslint-disable-next-line react/no-unused-state
  state = { search: { query: this.props.search || "" } };

  submitBtnRef = React.createRef<HTMLButtonElement>();

  render() {
    const searchClient = algoliasearch(
      "RZFI9YHKMB",
      "959671f0d835e32af44a31dd270a90d2"
    );

    // console.log(searchClient);

    return (
      <>
        <InstantSearch
          indexName="products"
          searchClient={searchClient}
          searchState={this.state.search}
          onSearchStateChange={searchState => {
            this.setState({ search: searchState });
          }}
        >
          <SearchBox
            onSubmit={e => {
              e.preventDefault();
              const el = e.currentTarget.querySelector('input[type="search"]');
              if (el) {
                const { value } = el;
                window.location.href = `/search?q=${encodeURIComponent(value)}`;
              }
            }}
          />
          <Results />
        </InstantSearch>
      </>
    );
  }
}