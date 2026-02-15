/**
 * Demo data for Meta App Review screencast.
 * Shows how pages_read_user_content data powers post analysis features.
 * This data is ONLY used when Demo Mode is enabled on the report page.
 */

export interface DemoPost {
  id: string;
  type: string;
  created_time: string;
  message: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  permalink_url: string;
  full_picture: string;
  media_type: string;
  is_paid: boolean;
}

export function generateDemoPosts(): DemoPost[] {
  return [
    {
      id: 'demo_post_1',
      type: 'video',
      created_time: '2026-02-10T09:30:00Z',
      message: '🎬 Behind the scenes of our latest product launch! Watch how our team brought this vision to life. #BTS #ProductLaunch',
      likes: 842,
      comments: 127,
      shares: 89,
      reach: 12500,
      impressions: 18200,
      engagement_rate: 8.47,
      permalink_url: 'https://facebook.com/demo/posts/1',
      full_picture: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop',
      media_type: 'video',
      is_paid: false,
    },
    {
      id: 'demo_post_2',
      type: 'photo',
      created_time: '2026-02-08T14:15:00Z',
      message: '✨ New collection drop! Which one is your favorite? Comment below 👇 #NewArrivals #StyleInspo',
      likes: 654,
      comments: 203,
      shares: 45,
      reach: 9800,
      impressions: 14500,
      engagement_rate: 9.2,
      permalink_url: 'https://facebook.com/demo/posts/2',
      full_picture: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
      media_type: 'photo',
      is_paid: true,
    },
    {
      id: 'demo_post_3',
      type: 'photo',
      created_time: '2026-02-06T11:00:00Z',
      message: 'Happy customers make our day! 🌟 Thank you for sharing your experience with us. #CustomerLove #Testimonial',
      likes: 521,
      comments: 67,
      shares: 34,
      reach: 7200,
      impressions: 10800,
      engagement_rate: 8.64,
      permalink_url: 'https://facebook.com/demo/posts/3',
      full_picture: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop',
      media_type: 'photo',
      is_paid: false,
    },
    {
      id: 'demo_post_4',
      type: 'video',
      created_time: '2026-02-04T16:45:00Z',
      message: '📊 Weekly tips: 5 ways to boost your social media engagement. Save this for later! #SocialMediaTips #GrowthHacks',
      likes: 389,
      comments: 92,
      shares: 156,
      reach: 15600,
      impressions: 22000,
      engagement_rate: 4.09,
      permalink_url: 'https://facebook.com/demo/posts/4',
      full_picture: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop',
      media_type: 'video',
      is_paid: false,
    },
    {
      id: 'demo_post_5',
      type: 'link',
      created_time: '2026-02-03T08:20:00Z',
      message: '📖 Our latest blog post: "The Ultimate Guide to Facebook Marketing in 2026". Link in comments!',
      likes: 278,
      comments: 45,
      shares: 112,
      reach: 8900,
      impressions: 13200,
      engagement_rate: 4.89,
      permalink_url: 'https://facebook.com/demo/posts/5',
      full_picture: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&h=400&fit=crop',
      media_type: 'link',
      is_paid: false,
    },
    {
      id: 'demo_post_6',
      type: 'status',
      created_time: '2026-02-01T12:00:00Z',
      message: 'Quick question: What content do you want to see more of? A) Tutorials B) Behind the scenes C) Customer stories',
      likes: 45,
      comments: 23,
      shares: 2,
      reach: 3200,
      impressions: 4500,
      engagement_rate: 2.19,
      permalink_url: 'https://facebook.com/demo/posts/6',
      full_picture: '',
      media_type: 'status',
      is_paid: false,
    },
    {
      id: 'demo_post_7',
      type: 'photo',
      created_time: '2026-01-30T10:30:00Z',
      message: 'Team spotlight: Meet Sarah, our lead designer! 🎨 #TeamSpotlight #MeetTheTeam',
      likes: 312,
      comments: 56,
      shares: 18,
      reach: 5400,
      impressions: 7800,
      engagement_rate: 7.15,
      permalink_url: 'https://facebook.com/demo/posts/7',
      full_picture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
      media_type: 'photo',
      is_paid: false,
    },
    {
      id: 'demo_post_8',
      type: 'link',
      created_time: '2026-01-28T15:00:00Z',
      message: 'Check out our updated pricing - now more affordable than ever! 💰',
      likes: 34,
      comments: 12,
      shares: 5,
      reach: 2800,
      impressions: 4100,
      engagement_rate: 1.82,
      permalink_url: 'https://facebook.com/demo/posts/8',
      full_picture: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=400&fit=crop',
      media_type: 'link',
      is_paid: true,
    },
    {
      id: 'demo_post_9',
      type: 'status',
      created_time: '2026-01-26T09:00:00Z',
      message: 'Monday motivation: Every great achievement starts with the decision to try. 💪',
      likes: 28,
      comments: 4,
      shares: 3,
      reach: 1900,
      impressions: 2800,
      engagement_rate: 1.84,
      permalink_url: 'https://facebook.com/demo/posts/9',
      full_picture: '',
      media_type: 'status',
      is_paid: false,
    },
    {
      id: 'demo_post_10',
      type: 'video',
      created_time: '2026-01-24T13:45:00Z',
      message: 'Live Q&A session recap - we answered your top 10 questions! Watch the highlights 🎥',
      likes: 456,
      comments: 78,
      shares: 67,
      reach: 11200,
      impressions: 16500,
      engagement_rate: 5.37,
      permalink_url: 'https://facebook.com/demo/posts/10',
      full_picture: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop',
      media_type: 'video',
      is_paid: false,
    },
  ];
}

export function generateDemoPostTypeStats() {
  return [
    { type: 'video', avgEngagement: 562, count: 3, engagement: 562 },
    { type: 'photo', avgEngagement: 496, count: 3, engagement: 496 },
    { type: 'link', avgEngagement: 243, count: 2, engagement: 243 },
    { type: 'status', avgEngagement: 53, count: 2, engagement: 53 },
  ];
}

export function generateDemoHeatmapData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const data: { day: string; hour: number; value: number }[] = [];

  // Peak times: weekday mornings 9-11, evenings 18-20, weekend afternoons
  for (const day of days) {
    for (const hour of hours) {
      let value = Math.floor(Math.random() * 20) + 5;
      const isWeekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(day);

      if (isWeekday && hour >= 9 && hour <= 11) value = Math.floor(Math.random() * 30) + 70;
      else if (isWeekday && hour >= 18 && hour <= 20) value = Math.floor(Math.random() * 25) + 60;
      else if (!isWeekday && hour >= 12 && hour <= 16) value = Math.floor(Math.random() * 20) + 50;
      else if (hour >= 7 && hour <= 21) value = Math.floor(Math.random() * 20) + 20;

      data.push({ day, hour, value });
    }
  }
  return data;
}

export function generateDemoCreatives() {
  const posts = generateDemoPosts().filter(p => p.full_picture);
  return posts.slice(0, 3).map(p => ({
    id: p.id,
    type: p.media_type as 'photo' | 'video' | 'link',
    thumbnail_url: p.full_picture,
    engagement: p.likes + p.comments + p.shares,
    engagement_rate: p.engagement_rate,
    permalink_url: p.permalink_url,
  }));
}
