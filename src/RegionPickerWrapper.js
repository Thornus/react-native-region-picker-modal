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
    if (this.props.cca2 !== prevProps.cca2) {
      let regionList = [];

      // console.log('showCities', this.props.showCities)
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
        // console.log('the cca2', this.props.cca2)
        regionList = [...countryRegionData.find(country => country.countryShortCode === this.props.cca2).regions]
      }

      this.setState({regionList});
    }
  }

  render() {
    let regionList = this.state.regionList;

    return(
    <RegionPicker
      showCities={this.props.showCities}
      onClose={this.props.onClose}
      onChange={this.props.onChange}
      regionList={regionList}
      closeable={this.props.closeable}
      filterable={this.props.filterable}
      filterPlaceholder={this.props.filterPlaceholder}
      filterPlaceholderTextColor={this.props.filterPlaceholderTextColor}
      autoFocusFilter={this.props.autoFocusFilter}
      disabled={this.props.disabled}
      transparent={this.props.transparent}
      animationType={this.props.animationType}
      closeButtonImage={this.props.closeButtonImage}
      flagType={this.props.flagType}
      hideAlphabetFilter={this.props.hideAlphabetFilter}
      showCallingCode={this.props.showCallingCode}
      renderFilter={this.props.renderFilter}
      excludeCountries={this.props.excludeCountries}
      showRegionNameWithFlag={this.props.showRegionNameWithFlag}
      hideFlag={this.props.hideFlag}
      transparent={this.props.transparent}
      cca2={this.props.cca2}
      selectedRegion={this.props.selectedRegion}
      selectedCity={this.props.selectedCity}
      translation={this.props.translation}
      styles={this.props.styles}
    />
    );
  }
}