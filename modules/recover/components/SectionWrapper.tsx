export const SectionWrapper = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-4 border-2 border-gray-300 p-4 rounded-md m-6">
      <h3>{title}</h3>
      {children}
    </div>
  );
};