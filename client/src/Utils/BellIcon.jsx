import React from 'react';
import styled from 'styled-components';

const BellIcon = () => {
  return (
    <StyledWrapper>
      <button className="button ">
        <svg viewBox="0 0 448 512" className="bell"><path d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z" /></svg>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .button {
    width: 50px;
    height: 50px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    
    border-radius: 50%;
    cursor: pointer;
    transition-duration: .3s;
    
    border: none;
  }

  .bell {
    width: 18px;
  }

  .bell path {
    fill: #8b5cf6;
  }

  

  .button:hover .bell {
    animation: bellRing 0.9s both;
  }

  /* bell ringing animation keyframes*/
  @keyframes bellRing {
    0%,
    100% {
      transform-origin: top;
    }

    15% {
      transform: rotateZ(10deg);
    }

    30% {
      transform: rotateZ(-10deg);
    }

    45% {
      transform: rotateZ(5deg);
    }

    60% {
      transform: rotateZ(-5deg);
    }

    75% {
      transform: rotateZ(2deg);
    }
  }

  .button:active {
    transform: scale(0.8);
  }`;

export default BellIcon;
