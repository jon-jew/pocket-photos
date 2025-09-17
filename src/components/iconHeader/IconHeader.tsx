import Image from "next/image";

const IconHeader = () => (
  <div className="centered-col !justify-end h-[300px] text-primary mb-8">
    <Image
      alt="Logo"
      className="mb-3"
      width={125}
      height={120}
      src="/logo.svg"
    />
    <h1 className="leading-[48px]">PLURR</h1>
    <p className="leading-[20px]">
      Create a photo album<br />together, instantly
    </p>
  </div>
);

export default IconHeader;
