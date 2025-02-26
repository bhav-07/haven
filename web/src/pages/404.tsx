const NotFound = () => {
  return (
    <div className="flex h-svh items-center gap-5 justify-center md:flex-row flex-col">
      <span className="lg:text-[190px] md:text-[120px] text-3xl items-center justify-center flex">
        404
      </span>
      <div className="lg:text-[210px] md:text-[120px] md:flex hidden font-thin">
        |
      </div>
      <span className="lg:text-2xl md:text-lg text-base text-center md:p-0 p-2">
        Sorry we could not find the page you are looking for {":("} <br />
        <a href="/home" className="hover:underline">
          Click here to go back to home page.
        </a>
      </span>
    </div>
  );
};

export default NotFound;
