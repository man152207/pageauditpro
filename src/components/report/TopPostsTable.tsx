import { cn } from '@/lib/utils';
import { 
  FileImage, 
  Video, 
  Link as LinkIcon, 
  MessageSquare,
  TrendingUp,
  Clock,
  Zap,
  Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface Post {
  id?: string;
  type?: string;
  created_time?: string;
  message?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  reach?: number;
  impressions?: number;
}

interface TopPostsTableProps {
  posts: Post[];
  isLoading?: boolean;
  className?: string;
}

const postTypeIcons: Record<string, React.ElementType> = {
  photo: FileImage,
  video: Video,
  link: LinkIcon,
  status: MessageSquare,
  default: MessageSquare,
};

function getPostTypeIcon(type?: string) {
  const normalizedType = type?.toLowerCase() || 'default';
  return postTypeIcons[normalizedType] || postTypeIcons.default;
}

function generateWhyItWorked(post: Post): string {
  const engagement = (post.likes || 0) + (post.comments || 0) + (post.shares || 0);
  const hints: string[] = [];

  // Check if we have enough metrics to infer why
  const hasMetrics = post.likes !== undefined || post.comments !== undefined || post.shares !== undefined;
  
  if (!hasMetrics || engagement === 0) {
    return 'Not enough data to infer why';
  }

  if (engagement > 100) hints.push('High engagement vs average');
  if (post.type?.toLowerCase() === 'video') hints.push('Video content performs well');
  if (post.type?.toLowerCase() === 'photo') hints.push('Visual content drives engagement');
  if ((post.shares || 0) > (post.likes || 0) * 0.1) hints.push('Strong share rate');
  if ((post.comments || 0) > (post.likes || 0) * 0.05) hints.push('Good conversation starter');

  return hints.length > 0 ? hints[0] : 'Not enough data to infer why';
}

/**
 * Top Posts Table (B5) - Client-ready table with responsive design
 */
export function TopPostsTable({ posts, isLoading, className }: TopPostsTableProps) {
  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-border overflow-hidden', className)}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-semibold text-sm">Post</th>
                <th className="text-left p-4 font-semibold text-sm">Date</th>
                <th className="text-right p-4 font-semibold text-sm">Reach</th>
                <th className="text-right p-4 font-semibold text-sm">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-t border-border">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </td>
                  <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="p-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                  <td className="p-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className={cn('rounded-xl border border-border p-8 text-center', className)}>
        <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">No posts available for analysis.</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Try a longer date range or run another audit later.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-border overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-semibold text-sm sticky left-0 bg-muted/50 z-10">
                Post
              </th>
              <th className="text-left p-4 font-semibold text-sm">Date</th>
              <th className="text-right p-4 font-semibold text-sm">
                <Tooltip>
                  <TooltipTrigger className="inline-flex items-center gap-1">
                    Reach
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Number of unique users who saw this post</p>
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="text-right p-4 font-semibold text-sm">
                <Tooltip>
                  <TooltipTrigger className="inline-flex items-center gap-1">
                    Engagement
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Total reactions, comments, and shares</p>
                  </TooltipContent>
                </Tooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.slice(0, 10).map((post, index) => {
              const Icon = getPostTypeIcon(post.type);
              const engagement = (post.likes || 0) + (post.comments || 0) + (post.shares || 0);
              const postDate = post.created_time ? new Date(post.created_time) : null;
              const whyItWorked = generateWhyItWorked(post);
              
              return (
                <tr 
                  key={post.id || index} 
                  className="border-t border-border hover:bg-muted/30 transition-colors group"
                >
                  <td className="p-4 sticky left-0 bg-card group-hover:bg-muted/30 transition-colors z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]">
                          {post.message?.substring(0, 50) || `${post.type || 'Post'} #${index + 1}`}
                          {post.message && post.message.length > 50 && '...'}
                        </p>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 cursor-help">
                              <TrendingUp className="h-3 w-3 text-success" />
                              Why it worked
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{whyItWorked}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
                    {postDate ? format(postDate, 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="p-4 text-right text-sm">
                    {post.reach?.toLocaleString() || post.impressions?.toLocaleString() || '—'}
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-semibold text-primary">{engagement.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground block">
                      {post.likes || 0}L • {post.comments || 0}C • {post.shares || 0}S
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
