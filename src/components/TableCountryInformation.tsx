import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import axios from "axios";
import styles from "../styles/components/CountryInformation.module.css";

interface countryDataType {
  id: string;
  iso2Code: string;
  name: string;
  region: {
    id: string;
    iso2code: string;
    value: string;
  };
  adminregion: {
    id: string;
    iso2code: string;
    value: string;
  };
  incomeLevel: {
    id: string;
    iso2code: string;
    value: string;
  };
  lendingType: {
    id: string;
    iso2code: string;
    value: string;
  };
  capitalCity: string;
  longitude: string;
  latitude: string;
}

export function TableCountryInformation() {
  const [country, setCountry] = useState<countryDataType | null>(null);
  async function getDataCountry() {
    console.log("getDataCountry");
    try {
      const result = await axios.get(
        "http://api.worldbank.org/v2/country/br?format=json"
      );
      console.log(result.data[1]);
      if (result.data[1].length > 0) {
        setCountry(result.data[1][0]);
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    getDataCountry();
  }, []);

  return (
    <div className={styles.container}>
       <Table className={styles.CountryInformation} responsive="sm">
        <thead>
          <tr>
            <th>id</th>
            <th>Name</th>
            <th>Region</th>
            <th>Admin Region</th>
            <th>Income Level</th>
            <th>Lending Type</th>
            <th>Capital City</th>
            <th>Longitude</th>
            <th>Latitude</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{country ? country.id : ""}</td>
            <td>{country ? country.name : ""}</td>
            <td>{country ? country.region.value : ""}</td>
            <td>{country ? country.adminregion.value : ""}</td>
            <td>{country ? country.incomeLevel.value : ""}</td>
            <td>{country ? country.lendingType.value : ""}</td>
            <td>{country ? country.capitalCity : ""}</td>
            <td>{country ? country.longitude : ""}</td>
            <td>{country ? country.latitude : ""}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}
