import { createFileRoute } from "@tanstack/react-router";
import { ProposalStudio } from "@/components/proposal-studio";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <ProposalStudio />;
}
