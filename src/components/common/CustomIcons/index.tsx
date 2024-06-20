import { NextPage } from "next";
import Image from "next/image";

interface Props {
  src: string;
  width?: number;
  height?: number;
}

const CustomLogo: NextPage<Props> = ({ src, width, height }) => {
  return (
    <>
      <Image
        style={{ width: width ? width : "100%", height: height ? height : "100%", objectFit: "cover" }}
        width={width ? width : 0}
        height={height ? height : 0}
        src={src}
        alt='raize'
      />
    </>
  );
};

export default CustomLogo;
