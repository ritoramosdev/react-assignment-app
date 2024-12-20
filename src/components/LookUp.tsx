import { useState } from "react";
import axios from "axios";

interface DomainInfo {
  domainName: string;
  registrarName: string;
  registrationDate: string;
  expirationDate: string;
  estimatedDomainAge: string;
  hostnames: string[];
}

interface ContactInfo {
  registrantName: string;
  technicalContactName: string;
  administrativeContactName: string;
  contactEmail: string;
}

interface CombinedInfo {
  domainInfo: DomainInfo;
  contactInfo: ContactInfo;
}

function LookUp() {
  const [domainName, setDomainName] = useState("");
  const [filter, setFilter] = useState<"domain" | "contact" | "both">("both");
  const [filteredData, setFilteredData] = useState<CombinedInfo | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [searchClicked, setSearchClicked] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const apiKey = "at_Xih71oD95poZRUriXhUJhJz0sGWnB";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDomainName(e.target.value);
  };

  const fetchData = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchClicked(true);

    if (!domainName) {
      setShowModal(true);
      return;
    }

    const urlBase = "https://www.whoisxmlapi.com/whoisserver/WhoisService?";
    const parameters = new URLSearchParams({
      domainName,
      apiKey,
      outputFormat: "json",
    });

    const url = urlBase + parameters.toString();
    axios
      .get(url)
      .then((result) => {
        const data = result.data;
        if (data.WhoisRecord) {
          const record = data.WhoisRecord;

          const domainInfo: DomainInfo = {
            domainName: record.domainName || "Not available",
            registrarName: record.registrarName || "Not available",
            registrationDate: record.createdDate || "Not available",
            expirationDate: record.expiresDate || "Not available",
            estimatedDomainAge: record.estimatedDomainAge
              ? `${record.estimatedDomainAge} years`
              : "Not available",
            hostnames: record.nameServers?.hostNames || [],
          };

          const contactInfo: ContactInfo = {
            registrantName: record.registrant?.name || "Not available",
            technicalContactName:
              record.technicalContact?.name || "Not available",
            administrativeContactName:
              record.administrativeContact?.name || "Not available",
            contactEmail: record.contactEmail || "Not available",
          };

          setFilteredData({ domainInfo, contactInfo });
          setError(false);
        } else {
          console.log("No WhoisRecord found.");
          setFilteredData(null);
          setError(true);
        }
      })
      .catch((error) => {
        console.log("Error:", error);
        setError(true);
      });
  };

  const handleFilterChange = (
    selectedFilter: "domain" | "contact" | "both"
  ) => {
    setFilter(selectedFilter);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="container-fluid">
      <div
        className="d-flex justify-content-center align-items-center fixed-top w-100 py-3 bg-light"
        style={{ zIndex: 1000 }}
      >
        <form
          className="d-flex justify-content-center"
          role="search"
          onSubmit={fetchData}
        >
          <input
            className="form-control me-2 w-auto"
            type="search"
            placeholder="Search domain"
            aria-label="Search"
            value={domainName}
            onChange={handleInputChange}
          />
          <button className="btn btn-outline-success w-auto" type="submit">
            Search
          </button>
        </form>
      </div>

      <div
        className="d-flex justify-content-center mt-5 pt-5"
        style={{ zIndex: 999 }}
      >
        <div
          className="btn-group"
          role="group"
          aria-label="Domain Filter Buttons"
        >
          <button
            type="button"
            className={`btn ${
              filter === "domain" ? "btn-primary" : "btn-secondary"
            }`}
            onClick={() => handleFilterChange("domain")}
          >
            Domain Info
          </button>
          <button
            type="button"
            className={`btn ${
              filter === "contact" ? "btn-primary" : "btn-secondary"
            }`}
            onClick={() => handleFilterChange("contact")}
          >
            Contact Info
          </button>
          <button
            type="button"
            className={`btn ${
              filter === "both" ? "btn-primary" : "btn-secondary"
            }`}
            onClick={() => handleFilterChange("both")}
          >
            Both
          </button>
        </div>
      </div>

      <div className="content-container mt-5" style={{ marginTop: "150px" }}>
        {error && (
          <div className="alert alert-danger text-center" role="alert">
            No records found for this domain.
          </div>
        )}

        <div className="container mt-4">
          {filteredData && !error && (
            <div>
              {filter === "domain" || filter === "both" ? (
                <div>
                  <h3 className="text-center">Domain Info</h3>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Information</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Domain Name</td>
                        <td>{filteredData.domainInfo.domainName}</td>
                      </tr>
                      <tr>
                        <td>Registrar Name</td>
                        <td>{filteredData.domainInfo.registrarName}</td>
                      </tr>
                      <tr>
                        <td>Registration Date</td>
                        <td>{filteredData.domainInfo.registrationDate}</td>
                      </tr>
                      <tr>
                        <td>Expiration Date</td>
                        <td>{filteredData.domainInfo.expirationDate}</td>
                      </tr>
                      <tr>
                        <td>Estimated Domain Age</td>
                        <td>{filteredData.domainInfo.estimatedDomainAge}</td>
                      </tr>
                      <tr>
                        <td>Hostnames</td>
                        <td>
                          <ul>
                            <li>
                              {filteredData.domainInfo.hostnames
                                .join(", ")
                                .slice(0, 25)}
                              {filteredData.domainInfo.hostnames.join(", ")
                                .length > 25
                                ? "..."
                                : ""}
                            </li>
                          </ul>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : null}

              {filter === "contact" || filter === "both" ? (
                <div>
                  <h3 className="text-center">Contact Info</h3>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Information</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Registrant Name</td>
                        <td>{filteredData.contactInfo.registrantName}</td>
                      </tr>
                      <tr>
                        <td>Technical Contact Name</td>
                        <td>{filteredData.contactInfo.technicalContactName}</td>
                      </tr>
                      <tr>
                        <td>Administrative Contact Name</td>
                        <td>
                          {filteredData.contactInfo.administrativeContactName}
                        </td>
                      </tr>
                      <tr>
                        <td>Contact Email</td>
                        <td>{filteredData.contactInfo.contactEmail}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        tabIndex={-1}
        style={{ display: showModal ? "block" : "none" }}
        aria-hidden={!showModal}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Error</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={closeModal}
              ></button>
            </div>
            <div className="modal-body">
              Please enter a domain name to search.
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LookUp;
