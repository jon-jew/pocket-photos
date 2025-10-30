import React from 'react';
import Image from 'next/image';
import clx from 'classnames';

interface TornContainerProps {
  children: React.ReactNode;
  smallXPadding?: boolean;
  isLoading?: boolean;
};

const TornContainer: React.FC<TornContainerProps> = ({
  children,
  smallXPadding,
  isLoading = false,
}) => {
  return (
    <div className="flex flex-col grow w-full relative">
      <svg
        viewBox="0.0 0.0 500.0 50.0"
        preserveAspectRatio="none"
        width="100%"
        height="35px"
        fill="none"
        stroke="none"
        strokeLinecap="square"
        strokeMiterlimit={10}
        xmlnsXlink="http://www.w3.org/1999/xlink"
        xmlns="http://www.w3.org/2000/svg"
      >
        <clipPath id="p.0">
          <path d="m0 0l500.0 0l0 50.0l-500.0 0l0 -50.0z" clipRule="nonzero" />
        </clipPath>
        <g clipPath="url(#p.0)">
          <path
            fill="#000000"
            fillOpacity={0}
            d="m0 0l500.0 0l0 50.0l-500.0 0z"
            fillRule="evenodd"
          />
          <path
            fill="#bd9cea"
            d="m0.037467718 50.093174l0 -47.351704l30.245813 4.699475l77.18506 -5.2217846l60.938126 7.0183725l16.721527 -2.4107609l63.780975 -2.8110237l53.029297 11.446195l63.062866 -12.450131l14.631134 2.1089237l12.362793 -2.7112858l17.19925 -1.355643l16.48111 7.0787396l50.89676 -7.51706l23.468842 -0.45931756l0 49.961945z"
            fillRule="evenodd"
          />
        </g>
      </svg>
      <div className={clx({
        "centered-col grow !justify-start bg-primary text-secondary": true,
        "gap-3 w-full px-6 pt-1 pb-5": true,
        // "[&>*]:transition-opacity [&>*]:duration-150": true,
        "!px-2 !gap-1": smallXPadding,
      })}>
        {children}
      </div>
      <div className={clx({
        "absolute bg-[#070217af] z-5 w-full h-full transition-[opacity] duration-150": true,
        "opacity-0 pointer-events-none": !isLoading,
      })}>
        <Image
          alt="Logo"
          className="fixed top-[400px] left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          width={62}
          height={60}
          src="/loading.gif"
        />
      </div>
    </div>
  );
};

export default TornContainer;
