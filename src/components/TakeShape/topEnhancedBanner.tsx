import React from "react";
import styled from "styled-components";
import Media from "react-responsive";

export interface TakeShapeTopEnhancedBannerInterface {
  content: any;
}

export const TakeShapeEnhancedTopBanner: React.FC<TakeShapeTopEnhancedBannerInterface> = content => {
  console.log(content.content);

  if (!content.content.getSiteSettings.helloBars.enhancedTopBar.display) {
    return <></>;
  }

  const bar = content.content.getSiteSettings.helloBars.enhancedTopBar;

  const desktopBackground = bar.desktopImage
    ? `center/cover no-repeat url(https://images.takeshape.io/${bar.desktopImage.path})`
    : bar.backgroundColor?.hex;

  const mobileBackground = bar.desktopImage
    ? `center/cover no-repeat url(https://images.takeshape.io/${bar.mobileImage.path})`
    : bar.backgroundColor?.hex;

  const ContainerMobile = styled.div`
    position: relative;
    height: 200px;
    background: ${mobileBackground};
  `;

  const ContainerDesktop = styled.div`
    position: relative;
    height: 300px;
    background: ${desktopBackground};
  `;

  const MyButton = styled.button`
    position: absolute;
    top: ${bar.button.topPixel}px;
    right: ${bar.button.rightPixel}px;
    background-color: ${bar.button.buttonColor?.hex};
    color: ${bar.button.buttonTextColor?.hex};
    font-size: 1.4rem;
    padding: 0.9rem 3.7rem;
    border: none;
    -webkit-transition: 0.3s;
    transition: 0.3s;
    outline: none;
    cursor: pointer;
  `;

  const HeaderMobile = styled.p`
    position: absolute;
    top: ${bar.headline.mobile.topPixel}px;
    right: ${bar.headline.mobile.rightPixel}px;
    color: ${bar.headline.fontColor?.hex};
    font-weight: bold;
    font-size: 3.5rem;
  `;

  const SubHeaderMobile = styled.p`
    position: absolute;
    top: ${bar.tagline.mobile.topPixel}px;
    right: ${bar.tagline.mobile.rightPixel}px;
    color: ${bar.tagline.fontColor?.hex};
    font-weight: bold;
    font-size: 2.5rem;
  `;

  const HeaderDesktop = styled.p`
    position: absolute;
    top: ${bar.headline.desktop.topPixel}px;
    right: ${bar.headline.desktop.rightPixel}px;
    color: ${bar.headline.fontColor?.hex};
    font-weight: bold;
    font-size: 3.5rem;
  `;

  const SubHeaderDesktop = styled.p`
    position: absolute;
    top: ${bar.tagline.desktop.topPixel}px;
    right: ${bar.tagline.desktop.rightPixel}px;
    color: ${bar.tagline.fontColor?.hex};
    font-weight: bold;
    font-size: 2.5rem;
  `;

  return (
    <>
      <Media minWidth="500px">
        <ContainerDesktop>
          <HeaderDesktop>{bar.headline.text}</HeaderDesktop>
          <SubHeaderDesktop>{bar.tagline.text}</SubHeaderDesktop>
          <a href={bar.button.buttonCta}>
            <MyButton>{bar.button.text}</MyButton>
          </a>
        </ContainerDesktop>
      </Media>
      <Media maxWidth="500px">
        <ContainerMobile>
          <HeaderMobile>{bar.headline.text}</HeaderMobile>
          <SubHeaderMobile>{bar.tagline.text}</SubHeaderMobile>
          <a href={bar.button.buttonCta}>
            <MyButton>{bar.button.text}</MyButton>
          </a>
        </ContainerMobile>
      </Media>
    </>
  );
};
