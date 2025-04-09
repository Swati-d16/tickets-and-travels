import React, { useEffect, useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";

// All available train tickets
const tickets = [
  ["Paris", "Skopje"],
  ["Zurich", "Amsterdam"],
  ["Prague", "Zurich"],
  ["Barcelona", "Berlin"],
  ["Kiev", "Prague"],
  ["Skopje", "Paris"],
  ["Amsterdam", "Barcelona"],
  ["Berlin", "Kiev"],
  ["Berlin", "Amsterdam"],
];

// Cities the son said he visited
const visitedCities = ["Amsterdam", "Kiev", "Zurich", "Prague", "Berlin", "Barcelona"];

// Build graph
const buildGraph = (tickets) => {
  const graph = new Map();
  for (let [from, to] of tickets) {
    if (!graph.has(from)) graph.set(from, []);
    graph.get(from).push(to);
  }
  return graph;
};

// Find route with backtracking
const findRoute = (graph, current, path, visited) => {
  if (path.length === visitedCities.length) {
    const sortedPath = [...path].sort();
    const sortedCities = [...visitedCities].sort();
    if (JSON.stringify(sortedPath) === JSON.stringify(sortedCities)) {
      return [...path];
    }
    return null;
  }

  const neighbors = graph.get(current) || [];
  for (let next of neighbors) {
    if (!visited.has(next) && visitedCities.includes(next)) {
      visited.add(next);
      path.push(next);
      const result = findRoute(graph, next, path, visited);
      if (result) return result;
      path.pop();
      visited.delete(next);
    }
  }

  return null;
};

// Generate flow elements
const generateFlowElements = (route, allTickets) => {
  const citySet = new Set();
  allTickets.forEach(([from, to]) => {
    citySet.add(from);
    citySet.add(to);
  });

  const positions = {};
  let index = 0;
  for (let city of citySet) {
    positions[city] = { x: (index % 4) * 180, y: Math.floor(index / 4) * 150 };
    index++;
  }

  const nodes = [...citySet].map((city) => ({
    id: city,
    data: { label: city },
    position: positions[city],
    style: {
      border: route.includes(city) ? "2px solid #2196f3" : "1px solid #ccc",
      background: route.includes(city) ? "#e3f2fd" : "#fff",
      padding: 10,
      borderRadius: 6,
    },
  }));

  const edges = allTickets.map(([from, to]) => ({
    id: `${from}-${to}`,
    source: from,
    target: to,
    animated: route.includes(from) && route.includes(to),
    style: {
      stroke: route.includes(from) && route.includes(to) ? "#2196f3" : "#aaa",
      strokeWidth: route.includes(from) && route.includes(to) ? 2 : 1,
    },
    label: route.includes(from) && route.includes(to) ? "used" : "",
    labelStyle: { fill: "#2196f3", fontWeight: "bold", fontSize: 12 },
  }));

  return { nodes, edges };
};

const RouteGraph = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const graph = buildGraph(tickets);
    const route = findRoute(graph, "Kiev", ["Kiev"], new Set(["Kiev"])) || [];
    const { nodes, edges } = generateFlowElements(route, tickets);
    setNodes(nodes);
    setEdges(edges);
  }, []);

  return (
    <div style={{ height: "600px", border: "1px solid #ccc", margin: "20px" }}>
      <h2 style={{ padding: "10px" }}>Europe Train Route (Visual)</h2>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default RouteGraph;
