import React from "react";
import { FormattedMessage } from "react-intl";
import { Button } from "@components/atoms";

export interface IAddToCartButton {
  disabled: boolean;
  onSubmit: () => void;
}

export const AddToCartButton: React.FC<IAddToCartButton> = ({
  onSubmit,
  disabled,
}) => {
  return (
    <Button
      fullWidth
      testingContext="addProductToCartButton"
      onClick={onSubmit}
      color="third"
      disabled={disabled}
    >
      <FormattedMessage defaultMessage="Add to cart" />
    </Button>
  );
};
AddToCartButton.displayName = "AddToCartButton";
export default AddToCartButton;
