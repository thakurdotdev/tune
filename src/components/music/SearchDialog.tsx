import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchMusic } from '@/queries/useMusic';
import { Loader2, Search, X, XCircle } from 'lucide-react';
import { useCallback, useState } from 'react';
import { FullSongCard } from './Cards';

const SearchDialog = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedQuery = useDebounce(searchQuery, 500);

  const { data: searchResults, isLoading } = useSearchMusic(debouncedQuery);

  const handleClose = useCallback(() => {
    setOpen(false);
    setSearchQuery('');
  }, [setOpen]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">Search Music</DialogTitle>
      <DialogContent
        className="p-0 overflow-hidden sm:max-w-5xl sm:h-[80vh] max-sm:w-full max-sm:h-screen max-sm:max-w-full max-sm:rounded-none"
        showCloseButton={false}
      >
        {/* Search Header */}
        <div className="sticky top-8 md:top-0 z-10 bg-background border-b p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for songs, artists, albums..."
                className="pl-10 pr-10 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full p-0"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              )}
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleClose}
              className="h-9 w-9 rounded-full p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="h-[calc(80vh-80px)] max-sm:h-[calc(100vh-80px)]">
          <div className="p-5 max-md:pb-10">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Searching for "{debouncedQuery}"...</p>
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Search Results</h3>
                  <span className="text-sm text-muted-foreground">
                    {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2">
                  {searchResults.map((song) => (
                    <FullSongCard key={song.id} song={song} />
                  ))}
                </div>
              </div>
            ) : debouncedQuery ? (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  We couldn't find anything for "{debouncedQuery}". Try searching with different
                  keywords.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Search for music</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Find your favorite songs. Start typing above to get started.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
