import React, { useState } from "react";
import { useIntl } from "react-intl";

import { commonMessages } from "@temp/intl";
import { ICheckoutModelLine } from "@saleor/sdk/lib/helpers";
import {
  ProductDetails_product_pricing,
  ProductDetails_product_variants,
  ProductDetails_product_variants_pricing,
} from "@saleor/sdk/lib/queries/gqlTypes/ProductDetails";

// import { ProductDescription } from "@components/molecules";
import { IProductVariantsAttributesSelectedValues } from "@types";
import QuantityInput from "../../molecules/QuantityInput";
import AddToCartButton from "../../molecules/AddToCartButton";
import ProductVariantPicker from "../ProductVariantPicker";
import * as S from "./styles";
import {
  getAvailableQuantity,
  getProductPrice,
  canAddToCart,
} from "./stockHelpers";

const LOW_STOCK_QUANTITY: number = 5;

export interface IAddToCartSection {
  productId: string;
  productVariants: ProductDetails_product_variants[];
  name: string;
  productPricing: ProductDetails_product_pricing;
  items: ICheckoutModelLine[];
  queryAttributes: Record<string, string>;
  isAvailableForPurchase: boolean | null;
  availableForPurchase: string | null;
  variantId: string;
  description: string;
  metadata: any;
  setVariantId(variantId: string): void;
  onAddToCart(variantId: string, quantity?: number): void;
  onAttributeChangeHandler(slug: string | null, value: string): void;
}

const AddToCartSection: React.FC<IAddToCartSection> = ({
  availableForPurchase,
  isAvailableForPurchase,
  items,
  name,
  productPricing,
  productVariants,
  queryAttributes,
  onAddToCart,
  onAttributeChangeHandler,
  setVariantId,
  description,
  variantId,
  metadata,
}) => {
  const intl = useIntl();

  const [quantity, setQuantity] = useState<number>(1);
  const [variantStock, setVariantStock] = useState<number>(0);
  const [
    variantPricing,
    setVariantPricing,
  ] = useState<ProductDetails_product_variants_pricing | null>(null);

  const availableQuantity = getAvailableQuantity(
    items,
    variantId,
    variantStock
  );
  const isOutOfStock = !!variantId && variantStock <= 0;
  const noPurchaseAvailable = !isAvailableForPurchase && !availableForPurchase;
  const purchaseAvailableDate =
    !isAvailableForPurchase &&
    availableForPurchase &&
    Date.parse(availableForPurchase);
  const isNoItemsAvailable = !!variantId && !isOutOfStock && !availableQuantity;
  const isLowStock =
    !!variantId &&
    !isOutOfStock &&
    !isNoItemsAvailable &&
    availableQuantity < LOW_STOCK_QUANTITY;

  let disableButton = !canAddToCart(
    items,
    !!isAvailableForPurchase,
    variantId,
    variantStock,
    quantity
  );

  const outOfStock = variantStock <= 0 && !!variantId;

  const renderErrorMessage = (message: string, testingContextId: string) => (
    <S.ErrorMessage
      data-test="stockErrorMessage"
      data-testId={testingContextId}
    >
      {message}
    </S.ErrorMessage>
  );

  const onVariantPickerChange = (
    _selectedAttributesValues?: IProductVariantsAttributesSelectedValues,
    selectedVariant?: ProductDetails_product_variants
  ): undefined => {
    if (!selectedVariant) {
      setVariantId("");
      setVariantPricing(null);
      setVariantStock(0);
      return;
    }
    setVariantId(selectedVariant.id);
    setVariantPricing(selectedVariant?.pricing);
    setVariantStock(selectedVariant?.quantityAvailable);
  };

  let drops = null;
  if (
    Object.keys(metadata).indexOf("COMING_SOON") > -1 &&
    Object.keys(metadata).indexOf("DROP_DATE") > -1
  ) {
    if (metadata.COMING_SOON.toLowerCase() === "true") {
      try {
        const dropDate = new Date(metadata.DROP_DATE);
        const now = new Date().valueOf();

        if (dropDate.valueOf() > now) {
          drops = `${dropDate.toLocaleDateString(
            "en-us"
          )} ${dropDate.toLocaleTimeString("en-us")}`;
          disableButton = true;
        }
      } catch (e) {
        //
      }
    }
  }

  return (
    <S.AddToCartSelection>
      <S.ProductNameHeader data-test="productName">{name}</S.ProductNameHeader>
      {!isOutOfStock && (
        <S.ProductPricing>
          {getProductPrice(productPricing, variantPricing)}
        </S.ProductPricing>
      )}
      {noPurchaseAvailable &&
        renderErrorMessage(
          intl.formatMessage(commonMessages.noPurchaseAvailable),
          "notAvailable"
        )}
      {purchaseAvailableDate &&
        renderErrorMessage(
          intl.formatMessage(commonMessages.purchaseAvailableOn, {
            date: new Intl.DateTimeFormat("default", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
            }).format(purchaseAvailableDate),
            time: new Intl.DateTimeFormat("default", {
              hour: "numeric",
              minute: "numeric",
            }).format(purchaseAvailableDate),
          }),
          "timeRestrictedAvailability"
        )}
      {isLowStock &&
        renderErrorMessage(
          intl.formatMessage(commonMessages.lowStock),
          "lowStockWarning"
        )}
      {isNoItemsAvailable &&
        renderErrorMessage(
          intl.formatMessage(commonMessages.noItemsAvailable),
          "noItemsAvailable"
        )}
      <S.VariantPicker>
        <ProductVariantPicker
          productVariants={productVariants}
          onChange={onVariantPickerChange}
          selectSidebar
          queryAttributes={queryAttributes}
          onAttributeChangeHandler={onAttributeChangeHandler}
        />
      </S.VariantPicker>
      <S.QuantityInput>
        <QuantityInput
          quantity={quantity}
          maxQuantity={availableQuantity}
          disabled={isOutOfStock || isNoItemsAvailable}
          onQuantityChange={setQuantity}
          hideErrors={!variantId || isOutOfStock || isNoItemsAvailable}
          testingContext="addToCartQuantity"
        />
      </S.QuantityInput>
      <AddToCartButton
        onSubmit={() => onAddToCart(variantId, quantity)}
        disabled={disableButton}
        specialColor={outOfStock}
        message={drops ? "Coming Soon" : "Add to Cart"}
      />
      {!!drops && <S.DropsAt>Drops {drops}</S.DropsAt>}
    </S.AddToCartSelection>
  );
};

AddToCartSection.displayName = "AddToCartSection";
export default AddToCartSection;
