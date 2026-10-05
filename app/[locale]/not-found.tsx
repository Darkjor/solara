import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="bg-hueso pt-16">
      <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-32 text-center">
        <p className="display text-8xl text-tierra-600">404</p>
        <h1 className="t-h3 display mt-4">{t("title")}</h1>
        <p className="mt-3 text-tinta-900">{t("body")}</p>
        <Link href="/" className="btn btn-primary mt-8">
          {t("home")}
        </Link>
      </div>
    </div>
  );
}
