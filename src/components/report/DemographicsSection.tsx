import { Card, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Users, MapPin, Globe } from 'lucide-react';

interface DemographicsData {
  genderAge?: Record<string, number>;
  cities?: Record<string, number>;
  countries?: Record<string, number>;
}

interface DemographicsSectionProps {
  demographics: DemographicsData | null;
}

const GENDER_COLORS = ['#3b82f6', '#ec4899', '#8b5cf6'];
const LOCATION_COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6'];

export function DemographicsSection({ demographics }: DemographicsSectionProps) {
  if (!demographics) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
          <Users className="h-8 w-8 text-primary relative z-10" />
        </div>
        <p className="font-medium text-foreground text-base mb-1">Loading Demographics...</p>
        <p className="text-sm max-w-xs mx-auto">
          Audience data is being fetched from Facebook. This typically takes 10-30 seconds.
        </p>
      </div>
    );
  }

  // Parse gender/age data
  const genderData = demographics.genderAge
    ? Object.entries(demographics.genderAge).reduce((acc, [key, value]) => {
        const [gender] = key.split('.');
        const genderLabel = gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : 'Other';
        const existing = acc.find(item => item.name === genderLabel);
        if (existing) {
          existing.value += value as number;
        } else {
          acc.push({ name: genderLabel, value: value as number });
        }
        return acc;
      }, [] as { name: string; value: number }[])
    : [];

  // Parse top cities
  const topCities = demographics.cities
    ? Object.entries(demographics.cities)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([name, value]) => ({ name, value: value as number }))
    : [];

  // Parse top countries
  const topCountries = demographics.countries
    ? Object.entries(demographics.countries)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([name, value]) => ({ name, value: value as number }))
    : [];

  const totalGender = genderData.reduce((sum, item) => sum + item.value, 0);
  const totalCities = topCities.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gender Distribution */}
        {genderData.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Gender Distribution</h4>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {genderData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        `${((value / totalGender) * 100).toFixed(1)}%`,
                        'Share',
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Cities */}
        {topCities.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Top Cities</h4>
              </div>
              <div className="space-y-3">
                {topCities.map((city, index) => (
                  <div key={city.name} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: LOCATION_COLORS[index % LOCATION_COLORS.length] }}
                    />
                    <span className="flex-1 truncate text-sm">{city.name}</span>
                    <span className="text-sm font-medium">
                      {((city.value / totalCities) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Countries */}
      {topCountries.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">Top Countries</h4>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
              {topCountries.map((country, index) => (
                <div
                  key={country.name}
                  className="p-3 rounded-lg bg-muted/50 text-center"
                  style={{ borderLeft: `3px solid ${LOCATION_COLORS[index % LOCATION_COLORS.length]}` }}
                >
                  <p className="font-semibold">{country.name}</p>
                  <p className="text-sm text-muted-foreground">{country.value.toLocaleString()} fans</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
