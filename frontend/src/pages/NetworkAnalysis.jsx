
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Car,
  CheckCircle2,
  Clock3,
  Database,
  FileSearch,
  Loader2,
  Network,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { useSearchParams } from "react-router-dom";

import {
  getConnections,
  verifyConnection,
} from "../api";

import { useAuth } from "../AuthContext";

import NetworkGraph from "../components/NetworkGraph";


function normalizeRegistration(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}


function getEntityType(entity) {
  return (
    entity?.type ||
    entity?.entityType ||
    entity?.kind ||
    "unknown"
  ).toLowerCase();
}


function getEntityName(entity) {
  return (
    entity?.name ||
    entity?.label ||
    entity?.vehicle ||
    entity?.vehicleRegistration ||
    entity?.ownerName ||
    "Unknown entity"
  );
}


function getVerificationKey(row) {
  return (
    String(row?.ownerName || "") +
    "::" +
    String(
      row?.vehicleRegistration ||
        row?.vehicle ||
        ""
    )
  );
}


export default function NetworkAnalysis() {
  const { token } = useAuth();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const initialVehicle =
    searchParams.get("vehicle") || "";

  const [registration, setRegistration] =
    useState(
      normalizeRegistration(initialVehicle)
    );

  const [connections, setConnections] =
    useState([]);

  const [verified, setVerified] =
    useState({});

  const [selected, setSelected] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [verifying, setVerifying] =
    useState(false);

  const [error, setError] =
    useState("");

  const [hasSearched, setHasSearched] =
    useState(Boolean(initialVehicle));


  /*
   * =======================================================
   * ANALYZE VEHICLE
   * =======================================================
   */

  const analyze = useCallback(
    async function analyzeVehicle(value) {
      const vehicle =
        normalizeRegistration(
          value === undefined
            ? registration
            : value
        );

      if (!vehicle) {
        setError(
          "Enter a vehicle registration."
        );
        return;
      }

      setError("");
      setLoading(true);
      setSelected(null);
      setConnections([]);
      setHasSearched(true);

      try {
        const data =
          await getConnections(token, vehicle);

        const rows =
          Array.isArray(data)
            ? data
            : [];

        setConnections(rows);
        setRegistration(vehicle);

        setSearchParams({
          vehicle: vehicle,
        });
      } catch (err) {
        console.error(
          "Network analysis failed:",
          err
        );

        setConnections([]);

        setError(
          err?.message ||
            "Unable to query the intelligence network."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      registration,
      setSearchParams,
      token,
    ]
  );


  /*
   * =======================================================
   * LOAD VEHICLE FROM URL
   * =======================================================
   */

  useEffect(function () {
    if (!initialVehicle) {
      return;
    }

    analyze(initialVehicle);
  }, []);


  /*
   * =======================================================
   * VERIFY CONNECTION
   * =======================================================
   */

  async function verify(ownerName) {
    if (!ownerName) {
      setError(
        "No owner relationship is available to verify."
      );
      return;
    }

    setError("");
    setVerifying(true);

    try {
      const result =
        await verifyConnection(
          token,
          ownerName,
          registration
        );

      const rows =
        Array.isArray(result)
          ? result
          : [];

      const next = {
        ...verified,
      };

      rows.forEach(function (row) {
        next[
          getVerificationKey(row)
        ] = Boolean(
          row?.verified
        );
      });

      setVerified(next);

      /*
       * Refresh the graph after verification.
       */
      await analyze(registration);

    } catch (err) {
      console.error(
        "Verification failed:",
        err
      );

      setError(
        err?.message ||
          "Unable to verify relationship."
      );
    } finally {
      setVerifying(false);
    }
  }


  /*
   * =======================================================
   * GRAPH STATISTICS
   * =======================================================
   */

  const stats = useMemo(
    function () {
      const owners = new Set();
      const suspects = new Set();

      connections.forEach(function (row) {
        if (row?.ownerName) {
          owners.add(row.ownerName);
        }

        if (row?.suspect) {
          suspects.add(row.suspect);
        }
      });

      const verifiedCount =
        connections.filter(
          function (row) {
            return Boolean(
              verified[
                getVerificationKey(row)
              ]
            );
          }
        ).length;

      return {
        total: connections.length,
        owners: owners.size,
        suspects: suspects.size,
        verified: verifiedCount,
      };
    },
    [
      connections,
      verified,
    ]
  );


  const first = connections[0];

  const selectedType =
    getEntityType(selected);

  const selectedName =
    getEntityName(selected);


  /*
   * =======================================================
   * CLEAR ANALYSIS
   * =======================================================
   */

  function clearAnalysis() {
    setRegistration("");
    setConnections([]);
    setSelected(null);
    setError("");
    setHasSearched(false);

    setSearchParams({});
  }


  /*
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (
    <div className="network-page">

      {/* =================================================
          HEADER
         ================================================= */}

      <div className="page-heading-row">

        <div>
          <div className="eyebrow">
            GRAPH INTELLIGENCE
          </div>

          <h2 className="page-title">
            Network Analysis
          </h2>

          <p className="page-subtitle">
            Trace vehicle ownership,
            relationships and investigative
            connections across the intelligence graph.
          </p>
        </div>


        {connections.length > 0 && (
          <button
            className="secondary-button"
            onClick={function () {
              analyze(registration);
            }}
            disabled={
              loading ||
              verifying
            }
          >
            <RefreshCw
              size={15}
              className={
                loading
                  ? "spin"
                  : ""
              }
            />

            REFRESH GRAPH
          </button>
        )}

      </div>


      {/* =================================================
          SEARCH
         ================================================= */}

      <form
        className="analysis-search"
        onSubmit={function (event) {
          event.preventDefault();
          analyze();
        }}
      >

        <Search size={18} />

        <input
          value={registration}
          onChange={function (event) {
            setRegistration(
              event.target.value.toUpperCase()
            );

            if (error) {
              setError("");
            }
          }}
          placeholder="Enter vehicle registration — e.g. MH05AB1234"
          spellCheck={false}
          autoComplete="off"
        />


        {registration && (
          <button
            type="button"
            className="analysis-clear"
            onClick={function () {
              setRegistration("");
            }}
            aria-label="Clear registration"
          >
            <X size={15} />
          </button>
        )}


        <button
          type="submit"
          className="primary-button"
          disabled={
            loading ||
            !registration.trim()
          }
        >

          {loading ? (
            <Loader2
              size={17}
              className="spin"
            />
          ) : (
            <Network size={17} />
          )}

          ANALYZE

        </button>

      </form>


      {/* =================================================
          ERROR
         ================================================= */}

      {error && (
        <div className="error-box network-error">

          <AlertCircle size={17} />

          <span>
            {error}
          </span>

        </div>
      )}


      {/* =================================================
          GRAPH STATISTICS
         ================================================= */}

      {connections.length > 0 && (
        <div className="network-stat-strip">

          <div className="network-stat">
            <Network size={16} />

            <div>
              <span>
                CONNECTIONS
              </span>

              <strong>
                {stats.total}
              </strong>
            </div>
          </div>


          <div className="network-stat">
            <UserRound size={16} />

            <div>
              <span>
                OWNERS
              </span>

              <strong>
                {stats.owners}
              </strong>
            </div>
          </div>


          <div className="network-stat">
            <ShieldCheck size={16} />

            <div>
              <span>
                VERIFIED
              </span>

              <strong>
                {stats.verified}
              </strong>
            </div>
          </div>


          <div className="network-stat">
            <FileSearch size={16} />

            <div>
              <span>
                SUSPECT LINKS
              </span>

              <strong>
                {stats.suspects}
              </strong>
            </div>
          </div>

        </div>
      )}


      {/* =================================================
          MAIN NETWORK WORKSPACE
         ================================================= */}

      <div className="network-layout">


        {/* =================================================
            GRAPH PANEL
           ================================================= */}

        <section
          className="intel-panel network-main"
        >

          <div className="panel-header">

            <div>
              <div className="eyebrow">
                RELATIONSHIP GRAPH
              </div>

              <h3>
                {registration ||
                  "Awaiting vehicle"}
              </h3>
            </div>


            {connections.length > 0 && (
              <div className="graph-legend">

                <span>
                  <i className="legend-line solid" />
                  VERIFIED
                </span>

                <span>
                  <i className="legend-line dashed" />
                  GHOST
                </span>

              </div>
            )}

          </div>


          {loading ? (

            <div className="loading-state large">

              <Loader2
                size={30}
                className="spin"
              />

              <strong>
                Querying intelligence graph...
              </strong>

              <span>
                Resolving vehicle relationships
                and connected entities.
              </span>

            </div>

          ) : connections.length ? (

            <NetworkGraph
              registration={registration}
              connections={connections}
              verified={verified}
              onSelect={setSelected}
            />

          ) : (

            <div className="empty-graph large">

              <Network size={46} />

              <strong>
                {hasSearched
                  ? "No network relationships found"
                  : "No network loaded"}
              </strong>

              <span>
                {hasSearched
                  ? "No connected intelligence was returned for " +
                    registration +
                    "."
                  : "Search a vehicle registration to retrieve its graph relationships."}
              </span>


              {hasSearched && (
                <button
                  className="secondary-button"
                  onClick={clearAnalysis}
                >
                  NEW ANALYSIS
                </button>
              )}

            </div>

          )}

        </section>


        {/* =================================================
            ENTITY INTELLIGENCE PANEL
           ================================================= */}

        <aside
          className="intel-panel entity-panel"
        >

          <div className="entity-panel-heading">

            <div>
              <div className="eyebrow">
                ENTITY INTELLIGENCE
              </div>

              <span className="entity-panel-subtitle">
                Select a node to inspect
              </span>
            </div>

          </div>


          {/* =================================================
              SELECTED ENTITY
             ================================================= */}

          {selected ? (

            <div className="entity-inspection">

              <div
                className={
                  "entity-symbol " +
                  (
                    selectedType === "vehicle"
                      ? "vehicle-symbol"
                      : selectedType === "person"
                      ? "person-symbol"
                      : "generic-symbol"
                  )
                }
              >

                {selectedType ===
                "vehicle" ? (
                  <Car size={25} />
                ) : selectedType ===
                  "person" ? (
                  <UserRound size={25} />
                ) : (
                  <Database size={25} />
                )}

              </div>


              <div className="entity-name-block">

                <h3>
                  {selectedName}
                </h3>

                <span className="entity-type">
                  {selectedType.toUpperCase()}
                </span>

              </div>


              <div className="entity-fields">

                <div>
                  <span>
                    ENTITY NAME
                  </span>

                  <strong>
                    {selectedName}
                  </strong>
                </div>


                {selected?.vehicle && (
                  <div>
                    <span>
                      VEHICLE
                    </span>

                    <strong className="mono">
                      {selected.vehicle}
                    </strong>
                  </div>
                )}


                {selected?.vehicleRegistration && (
                  <div>
                    <span>
                      REGISTRATION
                    </span>

                    <strong className="mono">
                      {
                        selected.vehicleRegistration
                      }
                    </strong>
                  </div>
                )}


                {selected?.ownerName && (
                  <div>
                    <span>
                      OWNER
                    </span>

                    <strong>
                      {selected.ownerName}
                    </strong>
                  </div>
                )}


                {selected?.suspect && (
                  <div>
                    <span>
                      RELATED SUSPECT
                    </span>

                    <strong>
                      {selected.suspect}
                    </strong>
                  </div>
                )}

              </div>


              {selected?.ownerName && (
                <div className="verification-box">

                  <div>
                    <ShieldCheck size={17} />

                    <span>
                      RELATIONSHIP STATUS
                    </span>
                  </div>


                  <p>
                    Relationships begin
                    unverified until an
                    authorized officer confirms
                    the connection.
                  </p>


                  <button
                    className="primary-button full"
                    disabled={verifying}
                    onClick={function () {
                      verify(
                        selected.ownerName
                      );
                    }}
                  >

                    {verifying ? (
                      <Loader2
                        size={16}
                        className="spin"
                      />
                    ) : (
                      <CheckCircle2
                        size={16}
                      />
                    )}

                    {verifying
                      ? "VERIFYING..."
                      : "VERIFY CONNECTION"}

                  </button>

                </div>
              )}

            </div>

          ) : first ? (

            /* =================================================
               DEFAULT VEHICLE INFORMATION
               ================================================= */

            <div className="entity-inspection">

              <div className="entity-symbol vehicle-symbol">
                <Car size={25} />
              </div>


              <div className="entity-name-block">

                <h3>
                  {first.vehicle ||
                    first.vehicleRegistration ||
                    registration}
                </h3>

                <span className="entity-type">
                  VEHICLE
                </span>

              </div>


              <div className="entity-fields">

                <div>
                  <span>
                    REGISTRATION
                  </span>

                  <strong className="mono">
                    {first.vehicle ||
                      first.vehicleRegistration ||
                      registration}
                  </strong>
                </div>


                <div>
                  <span>
                    PRIMARY OWNER
                  </span>

                  <strong>
                    {first.ownerName ||
                      "Unknown"}
                  </strong>
                </div>


                <div>
                  <span>
                    RELATED SUSPECT
                  </span>

                  <strong>
                    {first.suspect ||
                      "No match"}
                  </strong>
                </div>


                <div>
                  <span>
                    CONNECTIONS
                  </span>

                  <strong>
                    {connections.length}
                  </strong>
                </div>

              </div>


              <div className="verification-box">

                <div>
                  <ShieldCheck size={17} />

                  <span>
                    GHOST GRAPH RELATIONSHIP
                  </span>
                </div>


                <p>
                  Relationships begin
                  unverified until an
                  authorized officer confirms
                  the connection.
                </p>


                <button
                  className="primary-button full"
                  disabled={
                    verifying ||
                    !first.ownerName
                  }
                  onClick={function () {
                    verify(
                      first.ownerName
                    );
                  }}
                >

                  {verifying ? (
                    <Loader2
                      size={16}
                      className="spin"
                    />
                  ) : (
                    <CheckCircle2
                      size={16}
                    />
                  )}

                  {verifying
                    ? "VERIFYING..."
                    : "VERIFY CONNECTION"}

                </button>

              </div>

            </div>

          ) : (

            /* =================================================
               EMPTY ENTITY STATE
               ================================================= */

            <div className="entity-empty">

              <div className="entity-empty-icon">
                <Network size={24} />
              </div>

              <strong>
                No entity selected
              </strong>

              <span>
                Select a node in the
                relationship graph to inspect
                its intelligence.
              </span>

            </div>

          )}

        </aside>

      </div>


      {/* =================================================
          FOOTER STATUS
         ================================================= */}

      {connections.length > 0 && (
        <div className="network-analysis-footer">

          <div>
            <Clock3 size={14} />

            <span>
              LIVE GRAPH QUERY
            </span>
          </div>

          <div className="mono">
            {registration}
          </div>

          <div className="footer-divider" />

          <div>
            <ShieldCheck size={14} />

            <span>
              OFFICER ACCESS
            </span>
          </div>

        </div>
      )}

    </div>
  );
}

