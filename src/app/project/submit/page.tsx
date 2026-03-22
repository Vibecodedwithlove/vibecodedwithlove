import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ProjectSubmitForm from '@/components/projects/ProjectSubmitForm';

export const metadata: Metadata = {
  title: 'Submit Project - Vibe Coded with Love',
  description: 'Share your AI-powered project with the Vibe Coded with Love community',
};

export default async function SubmitPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Resources callout */}
        <div className="mb-8 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
          <p className="text-stone-700 dark:text-stone-300 text-sm">
            Before you submit, consider running a quick self-review using our{' '}
            <Link href="/resources" className="text-amber-700 dark:text-amber-400 font-medium hover:underline">
              free tools and prompts
            </Link>
            . It only takes a few minutes and can help you catch issues before the community does.
          </p>
        </div>

        <ProjectSubmitForm mode="create" />
      </div>
    </main>
  );
}
