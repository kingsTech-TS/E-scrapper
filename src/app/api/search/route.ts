import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const year_from = searchParams.get("year_from");
  const year_to = searchParams.get("year_to");
  const size = searchParams.get("size");

  const apiUrl = new URL("https://doaj-scrapper-api.onrender.com/search");
  if (query) apiUrl.searchParams.set("query", query);
  if (year_from) apiUrl.searchParams.set("year_from", year_from);
  if (year_to) apiUrl.searchParams.set("year_to", year_to);
  if (size) apiUrl.searchParams.set("size", size);

  try {
    const res = await fetch(apiUrl.toString());
    if (!res.ok) {
      return NextResponse.json(
        { error: "Upstream fetch failed" },
        { status: 500 }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
