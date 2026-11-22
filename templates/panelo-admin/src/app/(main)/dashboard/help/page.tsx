import { ContactSupport, HelpCategories, HelpFaq, HelpHero, PopularArticles } from "./_components/help-sections";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <HelpHero />
      <HelpCategories />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <PopularArticles />
        </div>
        <div className="lg:col-span-7">
          <HelpFaq />
        </div>
      </div>

      <ContactSupport />
    </div>
  );
}
