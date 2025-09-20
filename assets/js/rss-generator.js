// RSS Feed Generator for Blog
class RSSGenerator {
  constructor() {
    this.siteUrl = 'https://taufiq-ai.github.io'; // Update with your actual domain
    this.blogUrl = `${this.siteUrl}/blog`;
  }

  async generateRSSFeed() {
    try {
      // Load blog posts
      const response = await fetch('data/blog-posts.json');
      const posts = await response.json();

      // Sort by date (newest first)
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Generate RSS XML
      const rssXML = this.createRSSXML(posts);

      // Create blob and download
      const blob = new Blob([rssXML], { type: 'application/rss+xml' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rss.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('RSS feed generated successfully!');

    } catch (error) {
      console.error('Error generating RSS feed:', error);
    }
  }

  createRSSXML(posts) {
    const rssItems = posts.map(post => this.createRSSItem(post)).join('\n');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Taufiq's Tech Blog</title>
    <link>${this.blogUrl}</link>
    <description>Insights on AI, machine learning, software development, and technology trends</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${this.siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    <managingEditor>taufiqkhantusar@gmail.com (Taufiq Khan Tusar)</managingEditor>
    <webMaster>taufiqkhantusar@gmail.com (Taufiq Khan Tusar)</webMaster>
    <category>Technology</category>
    <category>Artificial Intelligence</category>
    <category>Machine Learning</category>
    <category>Programming</category>

${rssItems}

  </channel>
</rss>`;
  }

  createRSSItem(post) {
    const slug = post.slug || this.generateSlug(post.title);
    const postUrl = `${this.blogUrl}/${slug}.html`;
    const pubDate = new Date(post.date).toUTCString();
    const categories = post.tags ? post.tags.map(tag => `    <category>${tag}</category>`).join('\n') : '';

    return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>taufiqkhantusar@gmail.com (Taufiq Khan Tusar)</author>
${categories}
    </item>`;
  }

  generateSlug(title) {
    return title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Generate static RSS file (for manual deployment)
  async generateStaticRSS() {
    const response = await fetch('data/blog-posts.json');
    const posts = await response.json();
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return this.createRSSXML(posts);
  }
}

// Auto-generate RSS when blog data changes
// You can call this manually or integrate it into your build process
const rssGenerator = new RSSGenerator();

// Function to manually generate RSS (call this when needed)
function generateRSS() {
  rssGenerator.generateRSSFeed();
}