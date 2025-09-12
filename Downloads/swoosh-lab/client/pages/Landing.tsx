import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface AnalysisMeta { id: string; name: string; createdAt: number }

import Grid from "@/components/graphics/Grid";
import Aurora from "@/components/graphics/Aurora";
import Rays from "@/components/graphics/Rays";
import Noise from "@/components/graphics/Noise";
import LockBadge from "@/components/graphics/LockBadge";

export default function Landing() {
  const [name, setName] = useState("");
  const [analyses, setAnalyses] = useState<AnalysisMeta[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("analyses");
    if (raw) setAnalyses(JSON.parse(raw));
  }, []);

  const loginCount = useMemo(() => Number(localStorage.getItem("loginCount") || 0), []);
  const lastLogin = useMemo(() => {
    const ts = Number(localStorage.getItem("lastLogin") || 0);
    return ts ? new Date(ts).toLocaleString() : "-";
  }, []);

  const create = () => {
    if (!name.trim()) return;
    const id = slugify(name) + "-" + Math.random().toString(36).slice(2, 6);
    const next = [{ id, name: name.trim(), createdAt: Date.now() }, ...analyses].slice(0, 25);
    setAnalyses(next);
    localStorage.setItem("analyses", JSON.stringify(next));
    navigate(`/analysis/${id}`, { state: { name: name.trim() } });
  };

  return (
    <div className="relative min-h-screen bg-[radial-gradient(ellipse_at_top_left,theme(colors.slate.950),theme(colors.slate.900))]">
      <Grid />
      <Aurora />
      <Rays />
      <Noise />
      <LockBadge />
      <Navbar />
      <main className="container pb-24 pt-10">
        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle>Create new analysis</CardTitle>
              <CardDescription>Name your analysis and get started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter analysis name"
                  className="h-12 text-base"
                />
                <Button onClick={create} variant="gradient" className="h-12 px-6">Create</Button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">You can upload PDF, DOCX, TXT, CSV, JSON and images in the analysis page.</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Key usage metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between"><span>No. of logins</span><span className="font-semibold">{loginCount}</span></li>
                <li className="flex items-center justify-between"><span>Projects created</span><span className="font-semibold">{analyses.length}</span></li>
                <li className="flex items-center justify-between"><span>Last login</span><span className="font-medium">{lastLogin}</span></li>
                <li className="flex items-center justify-between"><span>Status</span><span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-300">All systems normal</span></li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="mx-auto mt-8 max-w-7xl">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle>Recent analyses</CardTitle>
              <CardDescription>Your latest work at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              {analyses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No analyses yet. Create your first one above.</p>
              ) : (
                <ul className="divide-y">
                  {analyses.map((a) => (
                    <li key={a.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">{a.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => navigate(`/analysis/${a.id}`, { state: { name: a.name } })}>Open</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}
