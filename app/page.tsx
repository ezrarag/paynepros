import { HomeSections } from "@/components/marketing/HomeSections"
import { marketingContentRepository } from "@/lib/repositories/marketing-content-repository"

export default async function Home() {
  const content = await marketingContentRepository.getHomeContent()
  return (
    <div className="h-full">
      <HomeSections sections={content.sections} />
    </div>
  )
}
