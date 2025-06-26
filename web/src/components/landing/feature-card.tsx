export const FeatureCard = ({
  imageSrc = "/kanban_preview.png",
  features = ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
  heading = "Features",
  className = "",
}) => {
  return (
    <section
      className={`w-full max-w-7xl items-center justify-center sticky top-20 ${className}`}
    >
      <img
        src={imageSrc}
        alt="Feature preview"
        className="w-full h-full rounded-2xl sm:rounded-3xl"
      />
      <div className="absolute rounded-2xl sm:rounded-3xl w-full top-0 h-full flex items-center justify-center group cursor-pointer touch-manipulation">
        <div
          className="w-full h-full rounded-2xl sm:rounded-3xl flex border-2 sm:border-4 border-[#eec09b] flex-col justify-center p-3 sm:p-6 
                        bg-transparent
                        group-hover:bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.8)_0%,_rgba(255,255,255,0.3)_70%,_transparent_100%)]
                        group-active:bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.8)_0%,_rgba(255,255,255,0.3)_70%,_transparent_100%)]
                        text-transparent group-hover:text-neutral-600 group-active:text-neutral-600
                        transition-all duration-300 ease-out
                        md:text-transparent md:group-hover:text-neutral-600 md:group-active:text-transparent
                        text-neutral-600 group-hover:animate-fade-in-200"
        >
          {heading && (
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4 text-center">
              {heading}
            </h2>
          )}
          <ul className="space-y-1 sm:space-y-2 text-center">
            {features.map((feature, index) => (
              <li
                key={index}
                className="text-sm sm:text-base md:text-lg font-medium"
              >
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
