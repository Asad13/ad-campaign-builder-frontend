const FormLayout = ({ title, subtitle, desc, children }) => {
  return (
    <div className="tw-flex tw-justify-center tw-items-center tw-min-h-[100vh]">
      <section className="tw-max-w-[402px] tw-w-full tw-p-4">
        <div className="tw-text-center tw-mb-4">
          <div className="tw-flex tw-justify-center tw-items-center tw-mb-8">
            <img
              src="/img/flash.png"
              alt="Logo"
              loading="eager"
              decoding="sync"
            />
            <span className="tw-inline-block tw-ml-4">FLASHR</span>
          </div>
          {subtitle && (
            <h5 className="tw-text-heading5 tw-font-bold tw-text-primary">
              {subtitle}
            </h5>
          )}
          <h3
            className="tw-text-heading3 tw-font-bold underline"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <p className="tw-text-heading6 tw-text-textDisabled tw-font-[450]">
            {desc}
          </p>
        </div>
        {children}
      </section>
    </div>
  );
};

export default FormLayout;
