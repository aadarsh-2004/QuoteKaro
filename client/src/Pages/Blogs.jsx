import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarDays, X, CheckCircle, Lightbulb, FileSignature ,TrendingUp, Search, MessageSquare, ShieldCheck } from 'lucide-react';
import { Helmet } from 'react-helmet-async'; // For SEO management
import Footer from './Footer'; // Assuming you have a Footer component

// Modal Component for displaying full blog content
const BlogModal = ({ isOpen, onClose, post }) => {
  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-auto relative transform transition-all scale-100 opacity-100 duration-300 flex flex-col h-full md:h-auto md:max-h-[90vh]">
        {/* Modal Header - This section will remain visible while content scrolls */}
        <div className="p-6 md:p-8 pb-4 flex-shrink-0 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors z-10"
            aria-label="Close blog post"
          >
            <X size={24} />
          </button>
          <img src={post.imageUrl} alt={post.title} className="w-full h-48 md:h-32 object-cover rounded-lg mb-4" />
          <h2 className="text-3xl md:text-xl font-bold text-slate-900 mb-2 leading-tight">{post.title}</h2>
          <div className="flex items-center text-sm text-gray-500">
            <CalendarDays className="w-4 h-4 mr-1" />
            <span>{post.date}</span>
            <span className="mx-2">•</span>
            <span>{post.readTime}</span>
          </div>
        </div>

        {/* Modal Content - This section will scroll */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8">
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.fullContent }}></div>
        </div>

        {/* Modal Footer (CTA) - This section will remain visible */}
        {post.cta && (
          <div className="text-center p-6 md:p-8 pt-4 flex-shrink-0 border-t border-gray-100">
            <Link
              to="/register"
              onClick={onClose} // Close modal when CTA is clicked
              className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 text-white font-semibold rounded-xl shadow-lg hover:bg-purple-700 transition-colors duration-200 group"
            >
              {post.cta}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Mock data for blog posts with full content
const blogPosts = [
  {
    id: 'why-instant-quotation-tools',
    title: 'Why Your Photography Business Needs Instant Quotation Tools in 2025',
    excerpt: 'Explore how modern photography businesses are saving hours each week with estimate tools like QuoteKaro. Discover the benefits of speed, professionalism, and accuracy.',
    keywords: 'photography business, instant quotes, estimate generator, photography software, QuoteKaro, client proposals, digital estimates',
    date: 'June 1, 2025',
    readTime: '5 min read',
    imageUrl: 'https://placehold.co/600x400/E0F2FE/6B46C1?text=Instant+Quotes', // Placeholder image
    cta: 'Try QuoteKaro for Free →',
    fullContent: `
      <p>In the competitive world of photography, time is money, and first impressions are everything. Many photographers still rely on manual methods like spreadsheets or generic word processors to create client estimates. This often leads to:</p>
      <ul class="list-disc list-inside space-y-2 mb-4">
        <li><strong>Wasted Hours:</strong> Manually typing out services, calculating totals, and formatting documents for each client.</li>
        <li><strong>Inconsistency:</strong> Estimates look different every time, lacking a professional, branded touch.</li>
        <li><strong>Errors:</strong> Manual calculations are prone to mistakes, leading to awkward corrections or lost revenue.</li>
        <li><strong>Slow Response Times:</strong> Clients often have to wait, and in today's fast-paced market, a slow response can mean losing a booking.</li>
      </ul>
      <p>This is where <strong>instant quotation tools like QuoteKaro</strong> become indispensable. QuoteKaro is specifically designed for photographers and studios to overcome these pain points by offering:</p>
      <ul class="list-disc list-inside space-y-2 mb-4">
        <li><CheckCircle className="inline-block w-5 h-5 text-green-500 mr-2" /><strong>Lightning-Fast Creation:</strong> Build a comprehensive, professional estimate in minutes, not hours, using pre-saved services and smart calculations.</li>
        <li><CheckCircle className="inline-block w-5 h-5 text-green-500 mr-2" /><strong>Stunning Professionalism:</strong> Choose from beautifully designed, industry-specific templates that automatically apply your branding, ensuring every quote looks polished and trustworthy.</li>
        <li><CheckCircle className="inline-block w-5 h-5 text-green-500 mr-2" /><strong>Accuracy Guaranteed:</strong> Automated calculations eliminate human error, giving you confidence in your pricing.</li>
        <li><CheckCircle className="inline-block w-5 h-5 text-green-500 mr-2" /><strong>Instant Delivery:</strong> Share estimates instantly via secure links or PDF, allowing you to respond to client inquiries faster and secure bookings before your competitors.</li>
      </ul>
      <p><strong>How QuoteKaro is Different:</strong> Unlike generic invoicing software, QuoteKaro is built with the unique needs of photographers in mind. Our templates, credit system, and focus on visual presentation cater directly to the creative industry, helping you not just send a price, but present a compelling proposal that truly reflects your brand's value. In 2025, having an instant, professional quotation tool isn't a luxury, it's a necessity for growth and efficiency.</p>
    `,
  },
  {
    id: 'client-winning-estimates',
    title: 'How to Send Client-Winning Estimates that Close Deals Faster',
    excerpt: 'Learn the secrets to crafting proposals that impress clients and boost your conversion rates. We cover clear pricing, service add-ons, and essential terms.',
    keywords: 'send estimate to client, close deals, estimate design, client proposals, photography pricing, sales strategy, conversion rates',
    date: 'June 25, 2025',
    readTime: '7 min read',
    imageUrl: 'https://placehold.co/600x400/F3E8FF/8B5CF6?text=Winning+Estimates', // Placeholder image
    cta: 'Discover QuoteKaro Features →',
    fullContent: `
      <p>A great estimate isn't just a list of prices; it's a sales tool. Many photographers struggle to convert inquiries into bookings, often because their estimates fail to truly engage or inform the client. Common pain points include:</p>
      <ul class="list-disc list-inside space-y-2 mb-4">
        <li><strong>Confusing Layouts:</strong> Clients get lost in dense text or disorganized service lists.</li>
        <li><strong>Hidden Costs:</strong> Unexpected fees or unclear terms lead to distrust.</li>
        <li><strong>Lack of Upselling:</strong> Missing opportunities to offer valuable add-ons that enhance the client's experience and your revenue.</li>
        <li><strong>Generic Presentation:</strong> Estimates that look like everyone else's fail to make a memorable impression.</li>
      </ul>
      <p>Here’s how to craft estimates that not only inform but also persuade, helping you close deals faster:</p>
      <ol class="list-decimal list-inside space-y-2 mb-4">
        <li><Lightbulb className="inline-block w-5 h-5 text-yellow-500 mr-2" /><strong>Use Templates with Clear Pricing:</strong> QuoteKaro offers professionally designed templates that guide the client's eye. Clearly itemize each service and its cost. Use sections for packages, hourly rates, and specific deliverables. Transparency builds trust.</li>
        <li><Lightbulb className="inline-block w-5 h-5 text-yellow-500 mr-2" /><strong>Include Your Services + Add-ons:</strong> Don't just list what's included; highlight optional add-ons like extra hours, albums, prints, or specialized editing. QuoteKaro makes it easy to add these as optional line items, giving clients choices and increasing your average booking value.</li>
        <li><Lightbulb className="inline-block w-5 h-5 text-yellow-500 mr-2" /><strong>Add Payment/Terms Note:</strong> Clearly state your payment schedule, cancellation policy, and any other crucial terms. This manages expectations and prevents future misunderstandings. QuoteKaro allows you to pre-save these terms to automatically include them in every estimate.</li>
        <li><Lightbulb className="inline-block w-5 h-5 text-yellow-500 mr-2" /><strong>Personalize and Brand:</strong> Every estimate should reflect your unique brand. With QuoteKaro, you can easily add your logo, brand colors (if customizing templates), and a personalized message. A branded, cohesive look speaks volumes about your professionalism.</li>
      </ol>
      <p><strong>How QuoteKaro Helps You Close Deals:</strong> QuoteKaro doesn't just generate documents; it generates confidence. By providing a streamlined, visually appealing, and comprehensive estimate, you empower your clients to make informed decisions quickly, reducing friction and accelerating your sales cycle. Stop just sending quotes; start sending client-winning proposals with QuoteKaro.</p>
    `,
  },
  {
    id: 'top-10-wedding-photography-tools',
    title: 'Top 10 Tools Every Wedding Photography Studio Should Use',
    excerpt: 'A curated list of essential software and resources for wedding photographers. From CRM to design, find out how to streamline your operations and enhance your client experience, including QuoteKaro.',
    keywords: 'wedding photography tools, studio software, photography CRM, Canva, Notion, Honeybook, QuoteKaro, business automation, client management, workflow optimization',
    date: 'June 18, 2025',
    readTime: '10 min read',
    imageUrl: 'https://placehold.co/600x400/FFF0F5/EC4899?text=Wedding+Tools', // Placeholder image
    cta: 'Explore Tools →',
    fullContent: `
      <p>Running a successful wedding photography studio goes beyond just taking beautiful photos. It involves intricate client management, marketing, invoicing, and constant communication. Many studios face the pain point of juggling too many manual tasks or disparate systems, leading to inefficiencies and lost time. The solution lies in leveraging the right tools.</p>
      <p>Here are our top 10 essential tools for every modern wedding photography studio, designed to streamline your workflow and enhance your client experience:</p>
      <ol class="list-decimal list-inside space-y-2 mb-4">
        <li><TrendingUp className="inline-block w-5 h-5 text-blue-500 mr-2" /><strong>QuoteKaro (Estimate Generation):</strong> Stop wasting hours on manual quotes. QuoteKaro allows you to create stunning, branded estimates in minutes, specifically tailored for photography services. It's fast, professional, and helps you close deals quicker.</li>
        <li><TrendingUp className="inline-block w-5 h-5 text-blue-500 mr-2" /><strong>Canva (Graphic Design):</strong> For quick social media graphics, client guides, or even simple branding elements, Canva is an intuitive, drag-and-drop design tool that empowers you to create professional visuals without needing extensive design skills.</li>
        <li><TrendingUp className="inline-block w-5 h-5 text-blue-500 mr-2" /><strong>Notion (Workspace & Organization):</strong> A versatile workspace for notes, project management, client pipelines, and internal wikis. Notion can be customized to fit your studio's unique organizational needs, keeping everything in one place.</li>
        <li><TrendingUp className="inline-block w-5 h-5 text-blue-500 mr-2" /><strong>HoneyBook (Client Management & CRM):</strong> An all-in-one platform for contracts, invoices, payments, and client communication. HoneyBook helps automate your client workflow from inquiry to booking.</li>
        <li><TrendingUp className="inline-block w-5 h-5 text-blue-500 mr-2" /><strong>Lightroom & Photoshop (Photo Editing):</strong> The industry standard for photo editing and retouching. Essential for delivering high-quality, polished images to your clients.</li>
        <li><TrendingUp className="inline-block w-5 h-5 text-blue-500 mr-2" /><strong>Pixieset/Pic-Time (Client Galleries & Delivery):</strong> Beautiful online galleries for delivering photos to clients. These platforms offer features like print sales, slideshows, and easy sharing.</li>
        <li><TrendingUp className="inline-block w-5 h-5 text-blue-500 mr-2" /><strong>QuickBooks/Wave (Accounting & Bookkeeping):</strong> Manage your studio's finances, track expenses, and prepare for tax season with dedicated accounting software.</li>
        <li><TrendingUp className="inline-block w-5 h-5 text-blue-500 mr-2" /><strong>Later/Planoly (Social Media Scheduling):</strong> Plan and schedule your social media content in advance, ensuring a consistent online presence without constant manual posting.</li>
        <li><TrendingUp className="inline-block w-5 h-5 text-blue-500 mr-2" /><strong>Zoom/Google Meet (Virtual Consultations):</strong> Essential for conducting virtual client meetings, especially for destination weddings or busy schedules.</li>
        <li><TrendingUp className="inline-block w-5 h-5 text-blue-500 mr-2" /><strong>Google Drive/Dropbox (Cloud Storage):</strong> Securely store and share large files, collaborate with team members, and ensure your precious client photos are backed up.</li>
      </ol>
      <p><strong>How QuoteKaro Fits In:</strong> While each of these tools serves a crucial purpose, QuoteKaro specifically addresses the initial, critical step of client engagement: the proposal. By integrating seamlessly into your workflow alongside these other tools, QuoteKaro ensures your first impression is always your best, setting the stage for a smooth client journey and successful booking.</p>
    `,
  },
  {
    id: 'increase-revenue-better-proposals',
    title: 'How I Increased My Studio’s Revenue 35% with Better Client Proposals',
    excerpt: 'A real-life case study detailing how one photography studio transformed their revenue by optimizing their client proposal process with QuoteKaro. Learn their strategies and results.',
    keywords: 'increase photography revenue, client proposals, studio growth, case study, QuoteKaro success, sales optimization, photography business tips',
    date: 'June 10, 2025',
    readTime: '8 min read',
    imageUrl: 'https://placehold.co/600x400/E6FFFA/38B2AC?text=Revenue+Growth', // Placeholder image
    cta: 'Read the Success Story →',
    fullContent: `
      <p>As a photography studio owner, I constantly looked for ways to boost our bookings and revenue. For years, our client proposal process was a major bottleneck. We'd spend hours manually creating estimates in spreadsheets, often leading to:</p>
      <ul class="list-disc list-inside space-y-2 mb-4">
        <li><strong>Delayed Responses:</strong> Clients would often move on to other studios because our quotes took too long.</li>
        <li><strong>Inconsistent Branding:</strong> Our proposals lacked a cohesive, professional look, undermining our perceived value.</li>
        <li><strong>Missed Upsell Opportunities:</strong> It was cumbersome to add optional services, so we rarely did, leaving money on the table.</li>
        <li><strong>Client Confusion:</strong> Complex layouts and unclear terms meant more back-and-forth, draining our time.</li>
      </ul>
      <p>Then, we discovered <strong>QuoteKaro</strong>. It wasn't just another invoicing tool; it was a game-changer for our entire client acquisition process. Here’s how QuoteKaro helped us achieve a remarkable 35% increase in revenue:</p>
      <h3 class="text-xl font-bold text-slate-900 mb-3">1. Speed and Efficiency: From Hours to Minutes</h3>
      <p>Before QuoteKaro, creating a detailed estimate for a wedding package could take up to 2 hours. With QuoteKaro's pre-saved service lists and smart templates, we cut that down to under 10 minutes. This meant we could respond to inquiries almost instantly, often being the first studio to send a professional proposal. This speed alone significantly improved our conversion rates.</p>
      <h3 class="text-xl font-bold text-slate-900 mb-3">2. Professionalism and Branding: Impressing Clients from the Start</h3>
      <p>QuoteKaro's beautiful, photography-specific templates allowed us to present our services in a visually stunning and branded way. Clients consistently commented on how professional and easy-to-understand our new estimates were. This elevated our brand perception, making us appear more reliable and high-end, even before the first photo was taken.</p>
      <h3 class="text-xl font-bold text-slate-900 mb-3">3. Strategic Upselling: Boosting Average Order Value</h3>
      <p>One of QuoteKaro's most impactful features was the ease of adding optional add-ons. We started including clear options for engagement shoots, premium albums, additional hours, and specialized prints directly within the estimate. Because it was so simple for clients to see and select these options, our average booking value increased by over 15% almost overnight. Clients felt empowered to customize their package, rather than feeling pressured.</p>
      <h3 class="text-xl font-bold text-slate-900 mb-3">4. Clarity and Trust: Reducing Friction</h3>
      <p>The structured layout and ability to include clear terms and conditions directly in the estimate significantly reduced client questions and confusion. Fewer emails back and forth meant less administrative burden for us and a smoother, more trustworthy experience for the client. This frictionless process made clients more confident in booking us.</p>
      <p><strong>The Result:</strong> Within six months of consistently using QuoteKaro, our studio saw a 35% increase in total revenue. This wasn't just from more bookings, but from higher average booking values and a more efficient sales process. QuoteKaro empowered us to spend less time on paperwork and more time doing what we love: capturing beautiful moments.</p>
      <p>If you're a photography studio looking to grow your revenue and streamline your operations, I cannot recommend QuoteKaro enough. It's an investment that pays for itself many times over.</p>
    `,
  },
  {
    id: 'seo-for-photographers',
    title: 'SEO for Photographers: How Estimates Can Boost Your Online Visibility',
    excerpt: 'Discover how professional estimates and client proposals can indirectly improve your search engine optimization and attract more organic traffic to your photography website.',
    keywords: 'SEO for photographers, photography website SEO, online visibility, client estimates, professional proposals, local SEO, organic traffic',
    date: 'June 8, 2025',
    readTime: '6 min read',
    imageUrl: 'https://placehold.co/600x400/D1FAE5/065F46?text=SEO+for+Photographers',
    cta: 'Optimize Your Estimates Today →',
    fullContent: `
      <p>Many photographers focus on website design and social media for SEO, but overlook a powerful indirect factor: the quality of their client estimates. While estimates don't directly get crawled by Google, they play a crucial role in your overall business reputation, client satisfaction, and ultimately, your online visibility.</p>
      <h3 class="text-xl font-bold text-slate-900 mb-3">The Indirect SEO Power of Professional Estimates:</h3>
      <ul class="list-disc list-inside space-y-2 mb-4">
        <li><Search className="inline-block w-5 h-5 text-blue-500 mr-2" /><strong>Increased Referrals & Word-of-Mouth:</strong> Happy clients are your best marketers. A professional, clear, and easy-to-understand estimate sets a positive tone from the start. Clients who have a smooth experience are more likely to refer you, leading to more direct traffic and brand mentions online, which Google values.</li>
        <li><Search className="inline-block w-5 h-5 text-blue-500 mr-2" /><strong>Better Online Reviews:</strong> A seamless quoting process contributes to overall client satisfaction. Satisfied clients are more inclined to leave positive reviews on Google My Business, Yelp, or industry-specific platforms. These reviews are a strong local SEO signal and build trust.</li>
        <li><Search className="inline-block w-5 h-5 text-blue-500 mr-2" /><strong>Reduced Bounce Rates:</strong> If your estimates are clear and lead to quicker bookings, clients spend less time bouncing between your site and other options. A lower bounce rate can signal to Google that your site provides a good user experience.</li>
        <li><Search className="inline-block w-5 h-5 text-blue-500 mr-2" /><strong>More Time for Content Creation:</strong> By automating your quoting with tools like QuoteKaro, you free up valuable time. This time can be reinvested into creating high-quality blog posts, portfolio updates, and other content that *directly* impacts your SEO.</li>
      </ul>
      <p><strong>How QuoteKaro Helps Your SEO:</strong> QuoteKaro streamlines your estimate process, ensuring every proposal is professional, branded, and clear. This leads to happier clients, more referrals, better reviews, and more time for you to focus on content that drives organic traffic. It's a holistic approach to growing your photography business online.</p>
    `,
  },
  {
    id: 'mastering-client-communication',
    title: 'Mastering Client Communication: From First Inquiry to Final Delivery',
    excerpt: 'Effective communication is key to client satisfaction and repeat business. Learn strategies to build rapport, manage expectations, and deliver exceptional service throughout the photography project lifecycle.',
    keywords: 'client communication, photography client management, client satisfaction, wedding photography communication, project management, client proposals, QuoteKaro communication',
    date: 'June 15, 2025',
    readTime: '9 min read',
    imageUrl: 'https://placehold.co/600x400/E0F7FA/00796B?text=Client+Communication',
    cta: 'Improve Your Client Workflow →',
    fullContent: `
      <p>Client communication is the backbone of any successful photography business. Misunderstandings, delays, or a lack of clarity can lead to frustration for both parties. Photographers often struggle with:</p>
      <ul class="list-disc list-inside space-y-2 mb-4">
        <li><strong>Setting Clear Expectations:</strong> Ambiguous terms leading to scope creep or client dissatisfaction.</li>
        <li><strong>Timely Responses:</strong> Juggling shoots, editing, and administrative tasks makes quick replies difficult.</li>
        <li><strong>Consistent Messaging:</strong> Ensuring all team members communicate the same information.</li>
        <li><strong>Managing Feedback:</strong> Handling revisions and critiques efficiently.</li>
      </ul>
      <p>Mastering client communication involves a strategic approach at every stage:</p>
      <h3 class="text-xl font-bold text-slate-900 mb-3">1. The First Inquiry & Proposal Stage:</h3>
      <p>This is your first chance to impress. Respond promptly and professionally. Use tools like <strong>QuoteKaro</strong> to send detailed, branded estimates that clearly outline services, pricing, and terms. This proactive clarity reduces initial questions and builds trust.</p>
      <h3 class="text-xl font-bold text-slate-900 mb-3">2. Booking & Onboarding:</h3>
      <p>Once booked, send a clear welcome packet. Use automated emails for payment reminders and upcoming shoot details. Platforms like HoneyBook can automate contracts and questionnaires.</p>
      <h3 class="text-xl font-bold text-slate-900 mb-3">3. Pre-Shoot & Shoot Day:</h3>
      <p>Confirm details a week before. Provide a clear timeline for the shoot day. Be present and communicative during the session, guiding clients through the process.</p>
      <h3 class="text-xl font-bold text-slate-900 mb-3">4. Post-Shoot & Delivery:</h3>
      <p>Communicate editing timelines. Deliver sneak peeks to build excitement. Use professional gallery platforms (like Pixieset) for final delivery, making it easy for clients to view, share, and download their images.</p>
      <h3 class="text-xl font-bold text-slate-900 mb-3">5. Feedback & Follow-up:</h3>
      <p>Actively solicit feedback. Address any concerns promptly and professionally. Follow up after a few months for testimonials or to offer future services.</p>
      <p><strong>How QuoteKaro Enhances Communication:</strong> QuoteKaro simplifies the crucial initial communication by providing clear, customizable estimates. By setting precise expectations from the very first proposal, it lays the groundwork for a smooth, transparent, and satisfying client journey, reducing friction and increasing client happiness.</p>
    `,
  },
  {
    id: 'automate-studio-operations',
    title: 'Automate Your Photography Studio: Tools & Strategies for Efficiency',
    excerpt: 'Learn how automation can free up your time from repetitive tasks, allowing you to focus on creative work and client relationships. Discover essential tools and strategies for a more efficient studio.',
    keywords: 'automate photography studio, studio efficiency, photography workflow, business automation, time management for photographers, CRM, online tools for studios, QuoteKaro automation',
    date: 'June 22, 2025',
    readTime: '8 min read',
    imageUrl: 'https://placehold.co/600x400/F0F4C3/827717?text=Studio+Automation',
    cta: 'Start Automating Today →',
    fullContent: `
      <p>Many photography studio owners find themselves bogged down by administrative tasks: sending emails, creating invoices, scheduling, and managing client data. This takes away precious time from shooting, editing, and client interaction. The pain point is clear: manual, repetitive tasks stifle growth and creativity.</p>
      <p>Automation is the key to unlocking efficiency and scaling your photography business. Here’s how to automate your studio operations:</p>
      <h3 class="text-xl font-bold text-slate-900 mb-3">1. Client Inquiry & Proposal Automation:</h3>
      <p>This is often the first bottleneck. Instead of manual estimates, use a tool like <strong>QuoteKaro</strong>. Automate proposal generation, send branded quotes instantly, and track their status. This saves hours and ensures a professional first impression.</p>
      <h3 class="text-xl font-bold text-slate-900 mb-3">2. CRM & Client Management:</h3>
      <p>Implement a CRM (Client Relationship Management) system (e.g., HoneyBook, Dubsado). Automate lead capture, send automated follow-up emails, manage contracts, and track client communication history in one place.</p>
      <h3 class="text-xl font-bold text-slate-900 mb-3">3. Scheduling & Booking:</h3>
      <p>Use online scheduling tools (e.g., Calendly, Acuity Scheduling) that integrate with your calendar. Clients can book sessions directly, eliminating back-and-forth emails.</p>
      <h3 class="text-xl font-bold text-slate-900 mb-3">4. Email & Marketing Automation:</h3>
      <p>Set up email sequences for onboarding new clients, sending post-shoot care instructions, or nurturing leads. Use email marketing platforms (e.g., Mailchimp, ConvertKit) to automate newsletters and promotional campaigns.</p>
      <h3 class="text-xl font-bold text-slate-900 mb-3">5. Invoicing & Payments:</h3>
      <p>Integrate invoicing with your CRM or use dedicated accounting software (e.g., QuickBooks, Wave). Automate invoice generation, payment reminders, and expense tracking.</p>
      <h3 class="text-xl font-bold text-slate-900 mb-3">6. Photo Delivery & Proofing:</h3>
      <p>Use online gallery platforms (e.g., Pixieset, Pic-Time) that automate gallery delivery, client proofing, and print ordering. This reduces manual file transfers and client communication.</p>
      <p><strong>How QuoteKaro Fits into Automation:</strong> QuoteKaro is your first step towards automating your sales pipeline. By making the estimate process fast and automated, it integrates seamlessly with your broader automation strategy, allowing you to spend less time on administrative tasks and more time on photography and client relationships. Embrace automation, embrace growth!</p>
    `,
  },
];

export default function BlogPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const openModal = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling background
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
    document.body.style.overflow = 'unset'; // Re-enable scrolling
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans flex flex-col">
      {/* Helmet for Blog Page SEO */}
      <Helmet>
        <title>QuoteKaro Blog | Insights & Tips for Photographers</title>
        <meta
          name="description"
          content="Explore the QuoteKaro blog for expert tips, industry insights, and guides on photography business, client proposals, estimate generation, and studio growth."
        />
        <meta
          name="keywords"
          content="photography blog, studio tips, client proposals, estimate software, photography business growth, QuoteKaro insights, freelance photography guide, photography marketing, sales for photographers, SEO for photographers, client communication, studio automation"
        />
        <link rel="canonical" href="https://www.quotekaro.in/blog" /> 
        
        {/* Open Graph Tags for Social Sharing */}
        <meta property="og:title" content="QuoteKaro Blog: Empowering Photographers with Knowledge" />
        <meta property="og:description" content="Find valuable articles and resources on improving your photography business, from efficient quoting to client management." />
        <meta property="og:image" content="/fullogo.png" /> {/* Replace with a suitable blog page image */}
        <meta property="og:url" content="https://quotekaro.in/blog" />
        <meta property="og:type" content="blog" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter Card Tags for Social Sharing */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="QuoteKaro Blog: Your Guide to Photography Business Success" />
        <meta name="twitter:description" content="Dive into articles on photography estimates, client winning strategies, and essential tools for studios and freelancers." />
        <meta name="twitter:image" content="/fullogo.png" /> {/* Replace with a suitable blog page image */}
        <meta name="twitter:site" content="https://x.com/QuoteKaro" /> {/* OPTIONAL: Your Twitter handle */}

        {/* Schema Markup for Blog (JSON-LD) */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Blog",
              "name": "QuoteKaro Blog",
              "description": "Expert tips, industry insights, and guides for photographers and studios on client proposals, estimate generation, and business growth.",
              "url": "https://quotekaro.in/blog",
              "publisher": {
                "@type": "Organization",
                "name": "QuoteKaro",
                "url": "https://quotekaro.in"
              },
              "blogPost": ${JSON.stringify(blogPosts.map(post => ({
                "@type": "BlogPosting",
                "headline": post.title,
                "description": post.excerpt, // Use excerpt for schema description
                "articleBody": post.fullContent, // Full content for schema
                "image": post.imageUrl,
                "url": `https://quotekaro.in/blog`, // URL points to the main blog page as content is in modal
                "datePublished": new Date(post.date).toISOString(),
                "author": {
                  "@type": "Organization", // or Person if you have specific authors
                  "name": "QuoteKaro Team"
                }
              })))}
            }
          `}
        </script>
      </Helmet>

      {/* Header (simplified for blog, or integrate your main navigation) */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-2">
              <FileSignature className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                QuoteKaro
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-8 text-slate-700 font-medium">
              <Link to="/" className="hover:text-purple-600 transition-colors duration-300">Home</Link>
              <Link to="/features" className="hover:text-purple-600 transition-colors duration-300">Features</Link>
              <Link to="/pricing" className="hover:text-purple-600 transition-colors duration-300">Pricing</Link>
              <Link to="/about-us" className="hover:text-purple-600 transition-colors duration-300">About Us</Link>
              <Link to="/login" className="px-5 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-200">Log In</Link>
              <Link to="/register" className="px-5 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200">Sign Up Free</Link>
            </div>
            {/* Mobile menu toggle would go here if needed, similar to LandingPage */}
          </div>
        </div>
      </header>

      {/* Blog Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 to-pink-50 py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <BookOpen className="w-16 h-16 text-purple-600 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-4 leading-tight">
            The QuoteKaro Blog
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Your go-to resource for expert tips, industry insights, and guides on growing your photography business with smart estimates.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transform transition-transform hover:scale-[1.02] duration-300 flex flex-col">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-2xl font-bold text-slate-900 mb-3 leading-snug">
                  {post.title}
                </h2>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <CalendarDays className="w-4 h-4 mr-1" />
                  <span>{post.date}</span>
                  <span className="mx-2">•</span>
                  <span>{post.readTime}</span>
                </div>
                <p className="text-slate-600 mb-6 flex-grow">
                  {post.excerpt}
                </p>
                {/* Changed Link to a button that opens the modal */}
                <button
                  onClick={() => openModal(post)}
                  className="inline-flex items-center text-purple-600 font-semibold hover:text-pink-600 transition-colors group mt-auto"
                >
                  Read More
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                {post.cta && (
                  <Link
                    to="/register" // Assuming CTA links to register page
                    className="mt-4 inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200 text-sm font-semibold"
                  >
                    {post.cta}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blog Modal */}
      <BlogModal isOpen={isModalOpen} onClose={closeModal} post={selectedPost} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
