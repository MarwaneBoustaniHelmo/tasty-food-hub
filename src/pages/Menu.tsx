import { useState, useMemo } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { PriceComparison } from '@/components/PriceComparison';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMenuData } from '@/hooks/useMenuApi';
import { useQueryClient } from '@tanstack/react-query';
import type { MenuItem, PlatformName } from '@/types/menu-aggregation';

const Menu = () => {
  const { data: menuItems = [], isLoading: loading, error: queryError } = useMenuData();
  const queryClient = useQueryClient();
  const error = queryError?.message || null;

  // Filters
  const [platformFilter, setPlatformFilter] = useState<PlatformName | 'all'>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique values for filter dropdowns
  const platforms = useMemo(() => {
    const platformSet = new Set<PlatformName>();
    menuItems.forEach(item => {
      item.platforms.forEach(p => platformSet.add(p.platform));
    });
    return Array.from(platformSet);
  }, [menuItems]);

  const branches = useMemo(() => {
    const branchSet = new Set<string>();
    menuItems.forEach(item => {
      item.platforms.forEach(p => branchSet.add(p.branch));
    });
    return Array.from(branchSet).sort();
  }, [menuItems]);

  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    menuItems.forEach(item => categorySet.add(item.category));
    return Array.from(categorySet).sort();
  }, [menuItems]);

  // Filter and search logic
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      // Platform filter
      if (platformFilter !== 'all') {
        const hasPlatform = item.platforms.some(p => p.platform === platformFilter);
        if (!hasPlatform) return false;
      }

      // Branch filter
      if (branchFilter !== 'all') {
        const hasBranch = item.platforms.some(p => p.branch === branchFilter);
        if (!hasBranch) return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = item.name.toLowerCase().includes(query);
        const descMatch = item.description?.toLowerCase().includes(query);
        const tagMatch = item.tags.some(tag => tag.toLowerCase().includes(query));
        if (!nameMatch && !descMatch && !tagMatch) return false;
      }

      return true;
    });
  }, [menuItems, platformFilter, branchFilter, categoryFilter, searchQuery]);

  // Find best price for an item
  const getBestPrice = (item: MenuItem) => {
    if (item.platforms.length === 0) return null;
    return item.platforms.reduce((best, current) => 
      current.price < best.price ? current : best
    );
  };

  const platformLabels: Record<PlatformName, string> = {
    ubereats: 'Uber Eats',
    deliveroo: 'Deliveroo',
    takeaway: 'Takeaway'
  };

  const platformColors: Record<PlatformName, string> = {
    ubereats: 'bg-[#06C167]',
    deliveroo: 'bg-[#00CCBC]',
    takeaway: 'bg-[#FF8000]'
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['menu'] });
  };

  return (
    <main className="pt-20 md:pt-24 pb-20 min-h-screen">
      <SEOHead
        title="Comparateur de Prix – Menu Tasty Food sur Uber Eats, Deliveroo & Takeaway"
        description="Comparez les prix des plats Tasty Food sur toutes les plateformes de livraison. Trouvez la meilleure offre pour vos burgers halal préférés à Liège."
        canonical="/menu"
      />

      {/* Header */}
      <section className="container px-4 mb-8">
        <header className="text-center mb-6">
          <h1 className="section-title mb-2">
            <span className="text-gradient-gold">COMPARATEUR</span> DE PRIX
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
            Comparez les prix de nos plats sur Uber Eats, Deliveroo et Takeaway. Trouvez la meilleure offre pour chaque restaurant.
          </p>
        </header>

        {/* Platform Availability Widget */}
        <div className="max-w-3xl mx-auto mb-8">
          <PriceComparison restaurantName="Tasty Food" />
        </div>

        {/* Filters */}
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter size={20} />
                Filtres
              </CardTitle>
              <CardDescription>Affinez votre recherche</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Platform filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Plateforme</label>
                  <Select value={platformFilter} onValueChange={(v) => setPlatformFilter(v as PlatformName | 'all')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      {platforms.map(platform => (
                        <SelectItem key={platform} value={platform}>
                          {platformLabels[platform]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Branch filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Restaurant</label>
                  <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      {branches.map(branch => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Catégorie</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Recherche</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      placeholder="Nom du plat..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* Active filters display */}
              {(platformFilter !== 'all' || branchFilter !== 'all' || categoryFilter !== 'all' || searchQuery) && (
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <span className="text-sm text-muted-foreground">Filtres actifs:</span>
                  {platformFilter !== 'all' && (
                    <Badge variant="secondary" className="gap-1">
                      {platformLabels[platformFilter]}
                    </Badge>
                  )}
                  {branchFilter !== 'all' && (
                    <Badge variant="secondary">{branchFilter}</Badge>
                  )}
                  {categoryFilter !== 'all' && (
                    <Badge variant="secondary">{categoryFilter}</Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="secondary">"{searchQuery}"</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPlatformFilter('all');
                      setBranchFilter('all');
                      setCategoryFilter('all');
                      setSearchQuery('');
                    }}
                  >
                    Réinitialiser
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results */}
      <section className="container px-4">
        <div className="max-w-5xl mx-auto">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Chargement des menus...</p>
            </div>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-600">Erreur de chargement</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
            </Card>
          )}

          {!loading && !error && filteredItems.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Aucun plat trouvé pour ces filtres.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setPlatformFilter('all');
                    setBranchFilter('all');
                    setCategoryFilter('all');
                    setSearchQuery('');
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          )}

          {!loading && !error && filteredItems.length > 0 && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredItems.length} plat{filteredItems.length > 1 ? 's' : ''} trouvé{filteredItems.length > 1 ? 's' : ''}
                </p>
              </div>

              <div className="space-y-4">
                {filteredItems.map(item => {
                  const bestPrice = getBestPrice(item);
                  return (
                    <Card key={item.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">{item.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {item.category}
                              {item.description && ` • ${item.description}`}
                            </CardDescription>
                            {item.tags.length > 0 && (
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {item.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 font-medium">Plateforme</th>
                                <th className="text-left py-2 font-medium">Restaurant</th>
                                <th className="text-right py-2 font-medium">Prix</th>
                                <th className="text-right py-2 font-medium">Livraison</th>
                                <th className="text-right py-2 font-medium">Min.</th>
                                <th className="text-right py-2"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.platforms.map((platform, idx) => (
                                <tr key={idx} className="border-b last:border-0">
                                  <td className="py-3">
                                    <Badge className={`${platformColors[platform.platform]} text-white`}>
                                      {platformLabels[platform.platform]}
                                    </Badge>
                                    {bestPrice && platform.price === bestPrice.price && (
                                      <Badge variant="outline" className="ml-2 text-xs border-green-500 text-green-600">
                                        Meilleur prix
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="py-3 text-muted-foreground">{platform.branch}</td>
                                  <td className="py-3 text-right font-semibold">
                                    {platform.price.toFixed(2)} {platform.currency}
                                  </td>
                                  <td className="py-3 text-right text-muted-foreground">
                                    {platform.deliveryFee !== null && platform.deliveryFee !== undefined
                                      ? `${platform.deliveryFee.toFixed(2)} €`
                                      : '–'}
                                  </td>
                                  <td className="py-3 text-right text-muted-foreground">
                                    {platform.minOrder !== null && platform.minOrder !== undefined
                                      ? `${platform.minOrder.toFixed(2)} €`
                                      : '–'}
                                  </td>
                                  <td className="py-3 text-right">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      asChild
                                    >
                                      <a href={platform.url} target="_blank" rel="noopener noreferrer">
                                        Commander
                                      </a>
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default Menu;
