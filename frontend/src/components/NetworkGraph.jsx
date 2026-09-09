import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import {
  Car,
  User,
  Building2,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

function EntityNode({ data }) {
  const type = data?.type || "person";

  const Icon =
    type === "vehicle"
      ? Car
      : type === "organization"
      ? Building2
      : type === "suspect"
      ? AlertTriangle
      : User;

  return (
    <div
      className={`network-node network-node-${type} ${
        data?.verified ? "network-node-verified" : ""
      }`}
      onClick={() => data?.onSelect?.(data)}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="network-handle"
      />

      <div className="network-node-icon">
        <Icon size={18} />
      </div>

      <div className="network-node-content">
        <strong>{data?.label || "Unknown entity"}</strong>

        {data?.subtitle && (
          <span>{data.subtitle}</span>
        )}

        {data?.verified && (
          <small>
            <ShieldCheck size={12} />
            VERIFIED
          </small>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="network-handle"
      />
    </div>
  );
}

const nodeTypes = {
  entity: EntityNode,
};

function normaliseConnections(connections, registration, onSelect) {
  if (!Array.isArray(connections)) {
    return {
      nodes: [],
      edges: [],
    };
  }

  const nodes = [];
  const edges = [];

  const nodeIds = new Set();

  function addNode(node) {
    if (!nodeIds.has(node.id)) {
      nodeIds.add(node.id);
      nodes.push(node);
    }
  }

  /*
   * Root vehicle
   */
  const rootId = `vehicle-${registration}`;

  addNode({
    id: rootId,
    type: "entity",
    position: {
      x: 350,
      y: 80,
    },
    data: {
      label: registration || "Vehicle",
      subtitle: "TARGET VEHICLE",
      type: "vehicle",
      onSelect,
    },
  });

  /*
   * Backend data can evolve.
   * We intentionally support several possible
   * property names instead of assuming one shape.
   */
  connections.forEach((connection, index) => {
    const ownerName =
      connection.ownerName ||
      connection.owner ||
      connection.personName ||
      connection.name;

    const suspectName =
      connection.suspect ||
      connection.suspectName;

    const vehicleRegistration =
      connection.vehicleRegistration ||
      connection.registration ||
      connection.vehicle ||
      registration;

    /*
     * OWNER
     */
    if (ownerName) {
      const ownerId = `person-${ownerName}-${index}`;

      addNode({
        id: ownerId,
        type: "entity",
        position: {
          x: 100 + (index % 3) * 250,
          y: 280,
        },
        data: {
          label: ownerName,
          subtitle: "REGISTERED OWNER",
          type: "person",
          ownerName,
          vehicleRegistration,
          verified: Boolean(connection.verified),
          onSelect,
        },
      });

      edges.push({
        id: `edge-owner-${index}`,
        source: rootId,
        target: ownerId,
        animated: Boolean(connection.verified),
        label: connection.verified
          ? "VERIFIED"
          : "ASSOCIATED",
        type: "smoothstep",
      });
    }

    /*
     * SUSPECT
     */
    if (suspectName) {
      const suspectId = `suspect-${suspectName}-${index}`;

      addNode({
        id: suspectId,
        type: "entity",
        position: {
          x: 100 + (index % 3) * 250,
          y: 500,
        },
        data: {
          label: suspectName,
          subtitle: "PERSON OF INTEREST",
          type: "suspect",
          suspectName,
          vehicleRegistration,
          onSelect,
        },
      });

      /*
       * If owner exists, connect suspect to owner.
       * Otherwise connect suspect directly to vehicle.
       */
      const sourceId = ownerName
        ? `person-${ownerName}-${index}`
        : rootId;

      edges.push({
        id: `edge-suspect-${index}`,
        source: sourceId,
        target: suspectId,
        label: "RELATIONSHIP",
        type: "smoothstep",
      });
    }
  });

  return {
    nodes,
    edges,
  };
}

export default function NetworkGraph({
  registration,
  connections,
  verified = {},
  onSelect,
}) {
  const graph = useMemo(() => {
    const result = normaliseConnections(
      connections,
      registration,
      (data) => {
        onSelect?.({
          ...data,
          verified:
            verified[
              `${data.ownerName}::${data.vehicleRegistration}`
            ] ?? data.verified,
        });
      }
    );

    return result;
  }, [
    connections,
    registration,
    verified,
    onSelect,
  ]);

  /*
   * IMPORTANT:
   * React Flow requires its parent to have
   * an explicit width AND height.
   */
  return (
    <div className="network-graph-wrapper">
      <ReactFlow
        nodes={graph.nodes}
        edges={graph.edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.25,
        }}
        minZoom={0.35}
        maxZoom={1.8}
        attributionPosition="bottom-left"
      >
        <Background gap={24} size={1} />

        <Controls
          showInteractive={false}
        />

        <MiniMap
          pannable
          zoomable
          nodeStrokeWidth={3}
        />
      </ReactFlow>
    </div>
  );
}