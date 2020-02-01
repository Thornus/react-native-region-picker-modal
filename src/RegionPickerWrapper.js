import React, { Component } from 'react'
import countryRegionData from 'country-region-data';
import usCitiesRaw from '../data/us-cities.json';
import RegionPicker from './RegionPicker.js';

export default class RegionPickerWrapper extends Component {

  constructor(props) {
    super(props);

    let regionList = this.props.regionList || [];

    if(!regionList.length) { //if regionList is not provided as props
      if(this.props.showCities) {
        const regionCode = this.props.selectedRegion;

        for (const cityData of usCitiesRaw) {
          if(cityData.state === regionCode) {
            let doesExist = false;
            for (const region of regionList) { //region is city in regionList
              if(region.name === cityData.city) {
                doesExist = true;
              }
            }

            if(!doesExist) {
              // cities don't have a real short code
              regionList.push({name: cityData.city, shortCode: cityData.city});
            }
          }
        }
      } else {
        regionList = [...countryRegionData.find(country => country.countryShortCode === this.props.cca2).regions]
      }
    }

    this.state = {
      regionList
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.cca2 !== prevProps.cca2 || this.props.selectedRegion !== prevProps.selectedRegion) {
      let regionList = [];

      if(this.props.showCities) {
        const regionCode = this.props.selectedRegion;

        for (const cityData of usCitiesRaw) {
          if(cityData.state === regionCode) {
            let doesExist = false;
            for (const region of regionList) { //region is city in regionList
              if(region.name === cityData.city) {
                doesExist = true;
              }
            }

            if(!doesExist) {
              // cities don't have a real short code
              regionList.push({name: cityData.city, shortCode: cityData.city});
            }
          }
        }
      } else {
        regionList = [...countryRegionData.find(country => country.countryShortCode === this.props.cca2).regions]
      }

      this.setState({regionList});
    }
  }

  render() {
    let regionList = this.state.regionList;

    return(
    <RegionPicker
      regionList={regionList}
      {...this.props}
    />
    );
  }
}