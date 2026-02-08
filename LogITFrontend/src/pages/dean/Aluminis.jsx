import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";
import { Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

function Aluminis() {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const sentinelRef = useRef(null);

  const fetchBatches = async (pageToLoad = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await api.get(
        `/dean/alumni/batches?page=${pageToLoad}&limit=${PAGE_SIZE}`,
      );

      const nextBatches = response.data?.batches || [];
      setBatches((prev) => (append ? [...prev, ...nextBatches] : nextBatches));
      setPage(response.data?.page || pageToLoad);
      setHasMore(Boolean(response.data?.hasMore));
    } catch (error) {
      console.error("Error fetching alumni batches:", error);
      toast.error("Failed to load alumni batches");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchBatches(1, false);
  }, [api]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loadingMore) {
          fetchBatches(page + 1, true);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page]);

  const visibleBatches = batches.filter((batch) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      batch.session_name?.toLowerCase().includes(query) ||
      String(batch.year || "").includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-b from-purple-600 to-indigo-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Alumini</h1>
            <p className="text-purple-100 text-lg">
              Past batches and alumni records
            </p>
          </div>
          <div className="w-full md:w-80 relative">
            <Search
              className="absolute left-3 top-3.5 text-gray-300"
              size={18}
            />
            <input
              type="text"
              placeholder="Search batch or year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 text-white placeholder:text-purple-100 focus:outline-none focus:ring-2 focus:ring-white/60"
            />
          </div>
        </div>
      </div>

      <Card elevated className="shadow-lg">
        <CardHeader withBorder className="bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alumni Batches</CardTitle>
              <CardDescription>
                Showing inactive batches from newest to oldest
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent padding="sm">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} elevated className="animate-pulse">
                  <CardContent padding="sm">
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : visibleBatches.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No alumni batches found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {visibleBatches.map((batch) => (
                <Card
                  key={batch._id}
                  elevated
                  className="cursor-pointer hover:shadow-lg transition"
                  onClick={() =>
                    navigate(`/dean/dashboard/alumini/${batch._id}`)
                  }
                >
                  <CardContent padding="sm">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Batch</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {batch.session_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Year: {batch.year}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div ref={sentinelRef} className="h-6" />

          {loadingMore && (
            <div className="text-center text-sm text-gray-500 mt-4">
              Loading more batches...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Aluminis;
