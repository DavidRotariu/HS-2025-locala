import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { locations } = body;

    if (!locations || locations.length < 2) {
      return NextResponse.json(
        { error: "At least two locations are required." },
        { status: 400 }
      );
    }

    const sortedLocations = findOptimalRoute(locations);
    return NextResponse.json({ sortedLocations });
  } catch (error) {
    console.error("Error computing route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function calculateDistance(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number {
  const dx = p1.lat - p2.lat;
  const dy = p1.lng - p2.lng;
  return Math.sqrt(dx * dx + dy * dy); // Euclidean distance
}

function findOptimalRoute(locations: { lat: number; lng: number }[]) {
  const numPoints = locations.length;
  const distanceMatrix: number[][] = Array.from({ length: numPoints }, () =>
    Array(numPoints).fill(0)
  );

  // Compute distance matrix
  for (let i = 0; i < numPoints; i++) {
    for (let j = 0; j < numPoints; j++) {
      if (i !== j) {
        distanceMatrix[i][j] = calculateDistance(locations[i], locations[j]);
      }
    }
  }

  // Solve TSP with fixed start and end
  const path = tspWithFixedStartAndEnd(distanceMatrix);

  return path.map((index) => locations[index]); // Return sorted locations
}

function tspWithFixedStartAndEnd(distanceMatrix: number[][]): number[] {
  const numPoints = distanceMatrix.length;
  const start = 0;
  const end = numPoints - 1;

  let shortestPath: number[] = [];
  let shortestDistance = Infinity;

  function calculateRouteDistance(route: number[]): number {
    return route.reduce((sum, curr, i) => {
      if (i === route.length - 1) return sum;
      return sum + distanceMatrix[curr][route[i + 1]];
    }, 0);
  }

  // Generate all permutations of intermediate points
  function permute(
    arr: number[],
    permutedRoutes: number[][] = [],
    current: number[] = []
  ): void {
    if (arr.length === 0) {
      const fullRoute = [start, ...current, end]; // Ensure start and end are fixed
      const totalDist = calculateRouteDistance(fullRoute);
      if (totalDist < shortestDistance) {
        shortestDistance = totalDist;
        shortestPath = [...fullRoute];
      }
      return;
    }

    for (let i = 0; i < arr.length; i++) {
      const newArr = arr.slice(0, i).concat(arr.slice(i + 1));
      permute(newArr, permutedRoutes, [...current, arr[i]]);
    }
  }

  const intermediatePoints = Array.from(
    { length: numPoints - 2 },
    (_, i) => i + 1
  );
  permute(intermediatePoints);

  return shortestPath;
}
