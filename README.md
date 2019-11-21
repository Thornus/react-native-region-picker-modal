<p align="center">
    <img alt="react-native-country-picker-modal" src="https://thumbs.gfycat.com/HandsomeInnocentAnura-size_restricted.gif" width=150>
</p>

<h3 align="center">
  The best Region Picker for React Native.
</h3>

<br />

## Description

This is a fork of [react-native-country-picker-modal](https://github.com/xcarpentier/react-native-country-picker-modal) by [Xavier Carpentier](https://xaviercarpentier.com).
It works fundamentally the same way as the Country Picker with the necessary tweaks to actually be a Region Picker.


## Installation
```bash
$ npm install react-native-region-picker-modal
```
or

```bash
$ yarn add react-native-region-picker-modal
```

## Basic Usage

WORK IN PROGRESS

```javascript
import  React  from  'react';
import  RegionPicker  from  'react-native-region-picker-modal';

export  default  class  Example  extends  React.Component {
	constructor() {
		this.state  = {
      cca2: 'US',
      selectedRegion: 'NY'
		};
	}

  render() {
    return (
      <RegionPicker
        onChange={value  => {
		      this.setState({selectedRegion: value.selectedRegion});
	        this.props.navigation.navigate('Step2', {countryCode:             this.state.cca2, regionCode:  value.selectedRegion})
        }}
        showRegionNameWithFlag
        hideFlag
        transparent
        cca2={this.state.cca2}
        selectedRegion={this.state.selectedRegion}
        translation="eng"
      />	
    )
  }
}
```
## License

[MIT](https://github.com/xcarpentier/react-native-country-picker-modal/blob/master/LICENSE.md)