import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ScheduledPost } from "@/hooks/useScheduledPosts";

interface CalendarGridProps {
  posts: ScheduledPost[];
  onDateClick: (date: Date) => void;
  onPostClick: (post: ScheduledPost) => void;
  onDeletePost?: (id: string) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  scheduled: { label: "Scheduled", variant: "default" },
  published: { label: "Published", variant: "outline" },
  failed: { label: "Failed", variant: "destructive" },
};

export function CalendarGrid({ posts, onDateClick, onPostClick, onDeletePost }: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }, [year, month]);

  const postsByDate = useMemo(() => {
    const map: Record<string, ScheduledPost[]> = {};
    posts.forEach((p) => {
      const dateKey = p.scheduled_at
        ? new Date(p.scheduled_at).toISOString().slice(0, 10)
        : p.created_at
        ? new Date(p.created_at).toISOString().slice(0, 10)
        : null;
      if (dateKey) {
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(p);
      }
    });
    return map;
  }, [posts]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border rounded-lg overflow-hidden">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-xs font-medium text-muted-foreground text-center py-2 bg-muted/30 border-b">
            {d}
          </div>
        ))}
        {calendarDays.map(({ date, isCurrentMonth }, i) => {
          const dateKey = date.toISOString().slice(0, 10);
          const dayPosts = postsByDate[dateKey] || [];
          const isToday = dateKey === today;

          return (
            <div
              key={i}
              className={cn(
                "min-h-[100px] border-b border-r p-1 cursor-pointer hover:bg-accent/30 transition-colors",
                !isCurrentMonth && "bg-muted/10 opacity-50"
              )}
              onClick={() => onDateClick(date)}
            >
              <div
                className={cn(
                  "text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                  isToday && "bg-primary text-primary-foreground"
                )}
              >
                {date.getDate()}
              </div>
              <div className="space-y-0.5">
                {dayPosts.slice(0, 3).map((p) => {
                  const sc = statusConfig[p.status] || statusConfig.draft;
                  return (
                    <Popover key={p.id}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            "w-full text-left text-[10px] leading-tight px-1 py-0.5 rounded truncate block",
                            p.status === "scheduled" && "bg-primary/10 text-primary",
                            p.status === "published" && "bg-green-500/10 text-green-700",
                            p.status === "failed" && "bg-destructive/10 text-destructive",
                            p.status === "draft" && "bg-muted text-muted-foreground"
                          )}
                        >
                          {p.content.slice(0, 30) || "Untitled"}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-3" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant={sc.variant}>{sc.label}</Badge>
                            {p.fb_connections?.page_name && (
                              <span className="text-xs text-muted-foreground">{p.fb_connections.page_name}</span>
                            )}
                          </div>
                          <p className="text-sm whitespace-pre-wrap break-words">{p.content || "No content"}</p>
                          {p.media_urls && p.media_urls.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {p.media_urls.map((url, idx) => (
                                <img key={idx} src={url} alt="" className="w-12 h-12 rounded object-cover border" />
                              ))}
                            </div>
                          )}
                          {p.scheduled_at && (
                            <p className="text-xs text-muted-foreground">
                              Scheduled: {new Date(p.scheduled_at).toLocaleString()}
                            </p>
                          )}
                          {p.error_message && (
                            <p className="text-xs text-destructive">{p.error_message}</p>
                          )}
                          <div className="flex gap-1 pt-1">
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => onPostClick(p)}>
                              <Pencil className="h-3 w-3 mr-1" /> Edit
                            </Button>
                            {onDeletePost && (
                              <Button size="sm" variant="destructive" className="flex-1" onClick={() => onDeletePost(p.id)}>
                                <Trash2 className="h-3 w-3 mr-1" /> Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  );
                })}
                {dayPosts.length > 3 && (
                  <span className="text-[10px] text-muted-foreground pl-1">
                    +{dayPosts.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
