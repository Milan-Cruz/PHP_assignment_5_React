import React, { useState } from 'react';
import './styles.css';
import 'mvp.css';

// Component for the search form
const SearchForm = ({ onSearch }) => {
    const [permitTypeInput, setPermitTypeInput] = useState('');
    const [orderBy, setOrderBy] = useState('asc');
    const [limit, setLimit] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        onSearch({ permitTypeInput, orderBy, limit });
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>Permit Type:</label>
            <input
                type="text"
                value={permitTypeInput}
                onChange={(e) => setPermitTypeInput(e.target.value)}
                placeholder="Permit type (e.g., multi, housing, personal)..."
            />

            <label>Order by Issue Date:</label>
            <select value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
            </select>

            <label>Limit Results (1-100):</label>
            <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                min="1"
                max="100"
                placeholder="Leave blank for default"
            />

            <button type="submit">Search</button>
        </form>
    );
};

// Component for displaying individual permit items
const PermitItem = ({ permit }) => {
    const { permit_number, issue_date, permit_type, work_type, neighbourhood_name, community, status, final_date } = permit;
    return (
        <div className="permit-item">
            <h3>Permit Number: {permit_number}</h3>
            <p>Issue Date: {issue_date}</p>
            <p>Permit Type: {permit_type}</p>
            <p>Work Type: {work_type}</p>
            <p>Neighbourhood: {neighbourhood_name}, {community}</p>
            <p>Status: {status}</p>
            <p>Final Date: {final_date}</p>
        </div>
    );
};

// Main App component
function App() {
    const [results, setResults] = useState([]);

    const fetchData = async ({ permitTypeInput, orderBy, limit }) => {
        let queryParams = `$order=issue_date%20${orderBy}&$where=lower(permit_type) like '%25${permitTypeInput}%25'`;

        if (limit !== '' && !isNaN(limit) && parseInt(limit) > 0 && parseInt(limit) <= 100) {
            queryParams += `&$limit=${limit}`;
        } else {
            queryParams += `&$limit=100`;
        }

        const url = `https://data.winnipeg.ca/resource/it4w-cpf4.json?${queryParams}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setResults([]);
        }
    };

    return (
        <div className="container">
            <h1>Winnipeg Building Permit Search</h1>
            <SearchForm onSearch={fetchData} />
            <div id="results" className="results">
                {results.length === 0 ? (
                    <p>No results found.</p>
                ) : (
                    results.map((permit) => <PermitItem key={permit.permit_number} permit={permit} />)
                )}
            </div>
        </div>
    );
}

export default App;
