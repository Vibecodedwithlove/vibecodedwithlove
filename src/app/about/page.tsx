import { Metadata } from 'next';
import Link from 'next/link';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import { COMMUNITY_GUIDELINES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Vibe Coded with Love, our mission, and community guidelines',
  openGraph: {
    title: 'About Vibe Coded with Love',
    description: 'Learn about our mission to celebrate AI-assisted development',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Hero Section */}
        <div className="mb-16 space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            About Vibe Coded with Love
          </h1>
          <p className="text-xl text-foreground/80 leading-relaxed">
            We&apos;re building a community where developers can share projects, celebrate AI-assisted development, and help each other grow.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16 space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
          <div className="space-y-4 text-lg text-foreground/80 leading-relaxed">
            <p>
              AI development tools have become powerful catalysts for creation. They&apos;ve lowered barriers to entry, accelerated learning, and enabled developers of all levels to build amazing things. But there&apos;s been a cloud hanging over all of this.
            </p>
            <p>
              Developers who openly acknowledge their use of AI tools face skepticism, judgment, and sometimes ostracism. Projects that used AI assistance, even transparently, get scrutinized in ways others don&apos;t. There&apos;s an unspoken fear that revealing the extent of AI involvement will diminish the work.
            </p>
            <p>
              We think that&apos;s backwards. Building with AI isn&apos;t lazy—it&apos;s smart. Knowing how to leverage these tools effectively is a valuable skill. Understanding your limits and using the right tools to overcome them is wisdom, not weakness.
            </p>
            <p>
              <strong>Vibe Coded with Love exists to celebrate the intersection of human creativity and AI capability.</strong> We want to build a space where transparency is valued, where projects built with AI are celebrated, and where developers feel safe sharing their full story—including the parts where they got help.
            </p>
          </div>
        </section>

        {/* Origin Story Section */}
        <section className="mb-16 space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Why This Matters</h2>
          <div className="space-y-4 text-lg text-foreground/80 leading-relaxed">
            <p>
              This platform exists because we&apos;ve seen what happens when developers are afraid to be honest about their process. A talented developer builds something impressive with help from an AI tool. It gets shared, celebrated, and gains attention. Then someone discovers the AI involvement. The response is often immediate and harsh: &quot;That&apos;s cheating.&quot; &quot;You didn&apos;t really build that.&quot; &quot;Delete it.&quot; The developer feels ambushed, the project gets pulled down, and everyone loses.
            </p>
            <p>
              This happens too often. In different contexts, with different tools, but the pattern is the same. Someone takes a creative risk with new technology. They&apos;re punished for honesty. Nobody wins. The community doesn&apos;t get to learn from a cool project. The developer loses confidence. The next person sees what happened and decides to stay silent instead.
            </p>
            <p>
              We&apos;re trying to break that cycle. By creating a space where AI-assisted development is the norm, not the exception—where transparency is rewarded, not punished—we can build a healthier community that learns from each other and celebrates innovation in all its forms.
            </p>
          </div>
        </section>

        {/* Community Guidelines */}
        <section className="mb-16 space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Community Guidelines</h2>
          <div className="prose prose-invert max-w-none">
            <MarkdownRenderer content={COMMUNITY_GUIDELINES} />
          </div>
        </section>

        {/* How to Contribute Section */}
        <section className="mb-16 space-y-6">
          <h2 className="text-3xl font-bold text-foreground">How to Contribute</h2>
          <div className="space-y-6">
            {/* Share a Project */}
            <div className="bg-input border border-border rounded-lg p-6 space-y-3">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                Share a Project
              </h3>
              <p className="text-foreground/80">
                Built something cool with AI assistance? We&apos;d love to see it. Head to our submit form and tell us about your project. Be honest about the tools you used and the extent of AI involvement—that transparency is what makes this community special.
              </p>
              <Link
                href="/project/submit"
                className="inline-block text-warmPrimary hover:text-warmPrimaryDark font-semibold transition-colors"
              >
                Submit a Project →
              </Link>
            </div>

            {/* Leave Suggestions */}
            <div className="bg-input border border-border rounded-lg p-6 space-y-3">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Leave Constructive Suggestions
              </h3>
              <p className="text-foreground/80">
                See a project that could be improved? Leave a thoughtful suggestion. Whether it&apos;s a security issue, performance optimization, UX improvement, or a bug fix, your feedback helps developers grow. Remember to be respectful and constructive.
              </p>
            </div>

            {/* Share Resources */}
            <div className="bg-input border border-border rounded-lg p-6 space-y-3">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <span className="text-2xl">📚</span>
                Share Resources
              </h3>
              <p className="text-foreground/80">
                Know about a great tool, tutorial, or article that would help other developers? We maintain a curated collection of resources on{' '}
                <Link href="/resources" className="text-warmPrimary hover:text-warmPrimaryDark">
                  our resources page
                </Link>
                . It&apos;s a great place to learn about AI development tools and security best practices.
              </p>
            </div>
          </div>
        </section>

        {/* Who Built This Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Who Built This</h2>
          <div className="bg-input border border-border rounded-lg p-6 sm:p-8 space-y-4">
            <p className="text-foreground/80 text-lg leading-relaxed">
              Vibe Coded with Love was built by a solo developer using <strong>Claude Code</strong>, Anthropic&apos;s CLI for Claude. Yes, that&apos;s the irony—a platform celebrating AI-assisted development was itself built with AI assistance. No apologies. This is exactly the kind of transparent, joyful development we want to celebrate.
            </p>
            <p className="text-foreground/80 text-lg leading-relaxed">
              Want to see this project&apos;s own entry on the platform? Check out{' '}
              <Link
                href="/project/vibe-coded-with-love"
                className="text-warmPrimary hover:text-warmPrimaryDark font-semibold transition-colors"
              >
                Vibe Coded with Love on the browse page
              </Link>
              . We practice what we preach.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
