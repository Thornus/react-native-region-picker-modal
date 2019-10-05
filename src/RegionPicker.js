// @flow
/* eslint import/newline-after-import: 0 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SafeAreaView from 'react-native-safe-area-view'

import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Modal,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  Platform
} from 'react-native'

import Fuse from 'fuse.js'

import countryRegionData from 'country-region-data';
import { getHeightPercent } from './ratio'
import CloseButton from './CloseButton'
import regionPickerStyles from './RegionPicker.style'
import KeyboardAvoidingView from './KeyboardAvoidingView'

let regions = null
let Emoji = null
let styles = {}

let isEmojiable = Platform.OS === 'ios'

const FLAG_TYPES = {
  flat: 'flat',
  emoji: 'emoji'
}

const setRegions = flagType => {
  if (typeof flagType !== 'undefined') {
    isEmojiable = flagType === FLAG_TYPES.emoji
  }

  if (isEmojiable) {
    regions = require('../data/countries-emoji.json')
    Emoji = require('./emoji').default
  } else {
    regions = require('../data/countries.json')
    Emoji = <View />
  }
}

setRegions()

export default class RegionPicker extends Component {
  static propTypes = {
    cca2: PropTypes.string.isRequired,
    selectedRegion: PropTypes.string.isRequired,
    translation: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onClose: PropTypes.func,
    closeable: PropTypes.bool,
    filterable: PropTypes.bool,
    children: PropTypes.node,
    regionList: PropTypes.array,
    excludeRegions: PropTypes.array,
    styles: PropTypes.object,
    filterPlaceholder: PropTypes.string,
    autoFocusFilter: PropTypes.bool,
    // to provide a functionality to disable/enable the onPress of Region Picker.
    disabled: PropTypes.bool,
    filterPlaceholderTextColor: PropTypes.string,
    closeButtonImage: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    transparent: PropTypes.bool,
    animationType: PropTypes.oneOf(['slide', 'fade', 'none']),
    flagType: PropTypes.oneOf(Object.values(FLAG_TYPES)),
    hideAlphabetFilter: PropTypes.bool,
    hideCountryFlag: PropTypes.bool,
    renderFilter: PropTypes.func,
    filterOptions: PropTypes.object,
    showRegionNameWithFlag: PropTypes.bool
  }

  static defaultProps = {
    translation: 'eng',
    hideCountryFlag: false,
    excludeRegions: [],
    filterPlaceholder: 'Filter',
    autoFocusFilter: true,
    transparent: false,
    animationType: 'none'
  }

  static renderEmojiFlag(cca2, emojiStyle) {
    return (
      <Text style={[regionPickerStyles.emojiFlag, emojiStyle]} allowFontScaling={false}>
        { // TO DO: pass right string to show flag
        /* {cca2 !== '' && regions[cca2.toUpperCase()] ? (
          <Emoji name={regions[cca2.toUpperCase()].flag} />
        ) : null} */}
      </Text>
    )
  }

  static renderImageFlag(cca2, imageStyle) {
    return cca2 !== '' ? (
      <Image
        resizeMode={'contain'}
        style={[regionPickerStyles.imgStyle, imageStyle]}
        source={{ uri: regions[cca2].flag }}
      />
    ) : null
  }

  static renderFlag(cca2, itemStyle, emojiStyle, imageStyle) {
    return (
      <View style={[regionPickerStyles.itemCountryFlag, itemStyle]}>
        {isEmojiable
          ? RegionPicker.renderEmojiFlag(cca2, emojiStyle)
          : RegionPicker.renderImageFlag(cca2, imageStyle)}
      </View>
    )
  }

  static renderFlagWithName(cca2, regionName, itemStyle, emojiStyle, imageStyle) {
    return (
      <View style={{flexDirection:'row', flexWrap:'wrap',alignItems: "center",}}>
        <View style={[regionPickerStyles.itemCountryFlag, itemStyle]}>
          {isEmojiable
            ? RegionPicker.renderEmojiFlag(cca2, emojiStyle)
            : RegionPicker.renderImageFlag(cca2, imageStyle)}

        </View>
        <Text style={{fontSize:16}}>{regionName}</Text>
      </View>
    )
  }

  constructor(props) {
    super(props)
    this.openModal = this.openModal.bind(this)

    setRegions(props.flagType)
    let regionList = [...countryRegionData.find(country => country.countryShortCode === props.cca2).regions]
    regions = regionList

    const excludeRegions = [...props.excludeRegions]

    excludeRegions.forEach(excludeRegion => {
      const index = regionList.indexOf(excludeRegion)

      if (index !== -1) {
        regionList.splice(index, 1)
      }
    })

    this.state = {
      modalVisible: false,
      regionList,
      flatListMap: regionList.map(n => ({ key: n })),
      dataSource: regionList,
      filter: '',
      letters: this.getLetters(regionList)
    }

    if (this.props.styles) {
      Object.keys(regionPickerStyles).forEach(key => {
        styles[key] = StyleSheet.flatten([
          regionPickerStyles[key],
          this.props.styles[key]
        ])
      })
      styles = StyleSheet.create(styles)
    } else {
      styles = regionPickerStyles
    }

    const options = Object.assign({
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ['name'],
      id: 'id'
    }, this.props.filterOptions);
    this.fuse = new Fuse(
      regionList.reduce(
        (acc, item) => [
          ...acc,
          { id: item, name: this.getRegionName(this.props.selectedRegion) }
        ],
        []
      ),
      options
    )
  }

  componentDidUpdate (prevProps) {
      if (prevProps.cca2 !== this.props.cca2) {
        let regionList = [...countryRegionData.find(country => country.countryShortCode === this.props.cca2).regions]
        regions = regionList
        
        this.setState({
          cca2: this.props.cca2,
          dataSource: regionList,
          flatListMap: regionList.map(n => ({ key: n }))
        })
      }
    }

  onSelectRegion(selectedRegion) {
    this.setState({
      modalVisible: false,
      filter: '',
      dataSource: this.state.regionList,
      flatListMap: this.state.regionList.map(n => ({ key: n }))
    })

    this.props.onChange({
      selectedRegion,
      flag: undefined,
      name: this.getRegionName(selectedRegion)
    })
  }

  onClose = () => {
    this.setState({
      modalVisible: false,
      filter: '',
      dataSource: regions
    })
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  getRegionName(selectedRegion, optionalTranslation) {
    const translation = optionalTranslation || this.props.translation || 'eng'

    //find region based on selectedRegion (region code) else default to first region
    let region = regions.find(region => region.shortCode === selectedRegion) || regions[0]

    return region.name
  }

  setVisibleListHeight(offset) {
    this.visibleListHeight = getHeightPercent(100) - offset
  }

  getLetters(list) {
    return Object.keys(
      list.reduce(
        (acc, val) => ({
          ...acc,
          [this.getRegionName(this.props.selectedRegion)
            .slice(0, 1)
            .toUpperCase()]: ''
        }),
        {}
      )
    ).sort()
  }

  openModal = this.openModal.bind(this)

  // dimensions of region list and window
  itemHeight = getHeightPercent(7)
  listHeight = regions.length * this.itemHeight

  openModal() {
    this.setState({ modalVisible: true })
  }

  scrollTo(letter) {
    // find position of first region that starts with letter
    const index = regions
      .map(region => this.getRegionName(this.props.selectedRegion))
      .indexOf(letter)
    if (index === -1) {
      return
    }
    let position = index * this.itemHeight

    // do not scroll past the end of the list
    if (position + this.visibleListHeight > this.listHeight) {
      position = this.listHeight - this.visibleListHeight
    }

    this._flatList.scrollToIndex({ index });
  }

  handleFilterChange = value => {
    const filteredRegions =
      value === '' ? regions : this.fuse.search(value)
    this._flatList.scrollToOffset({ offset: 0 });

    this.setState({
      filter: value,
      dataSource: filteredRegions,
      flatListMap: filteredRegions.map(n => ({ key: n }))
    })
  }

  renderRegion(selectedRegion) {
    return (
      <TouchableOpacity
        key={selectedRegion}
        onPress={() => this.onSelectRegion(selectedRegion)}
        activeOpacity={0.99}
        testID={`country-selector-${this.getRegionName(selectedRegion)}`}
      >
        {this.renderRegionDetail(selectedRegion)}
      </TouchableOpacity>
    )
  }

  renderLetters(letter, index) {
    return (
      <TouchableOpacity
        testID={`letter-${letter}`}
        key={index.toString()}
        onPress={() => this.scrollTo(letter)}
        activeOpacity={0.6}
      >
        <View style={styles.letter}>
          <Text style={styles.letterText} allowFontScaling={false}>
            {letter}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  renderRegionDetail(selectedRegion) {
    return (
      <View style={styles.itemCountry}>
        {!this.props.hideCountryFlag &&
          RegionPicker.renderFlag(selectedRegion,
                styles.itemCountryFlag,
                styles.emojiFlag,
                styles.imgStyle)}
        <View style={styles.itemCountryName}>
          <Text style={styles.countryName} allowFontScaling={false}>
            {this.getRegionName(selectedRegion)}
          </Text>
        </View>
      </View>
    )
  }

  renderFilter = () => {
    const {
      renderFilter,
      autoFocusFilter,
      filterPlaceholder,
      filterPlaceholderTextColor
    } = this.props

    const value = this.state.filter
    const onChange = this.handleFilterChange
    const onClose = this.onClose

    return renderFilter ? (
      renderFilter({ value, onChange, onClose })
    ) : (
      <TextInput
        testID="text-input-country-filter"
        autoFocus={autoFocusFilter}
        autoCorrect={false}
        placeholder={filterPlaceholder}
        placeholderTextColor={filterPlaceholderTextColor}
        style={[styles.input, !this.props.closeable && styles.inputOnly]}
        onChangeText={onChange}
        value={value}
      />
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          disabled={this.props.disabled}
          onPress={() => this.setState({ modalVisible: true })}
          activeOpacity={0.7}
        >
          {this.props.children ? (
            this.props.children
          ) : (
            <View
              style={[styles.touchFlag, { marginTop: isEmojiable ? 0 : 5 }]}
            >
              {this.props.showRegionNameWithFlag && RegionPicker.renderFlagWithName(this.props.cca2, this.getRegionName(this.props.selectedRegion),
                styles.itemCountryFlag,
                styles.emojiFlag,
                styles.imgStyle)}

              {!this.props.showRegionNameWithFlag && RegionPicker.renderFlag(this.props.cca2,
                styles.itemCountryFlag,
                styles.emojiFlag,
                styles.imgStyle)}
            </View>
          )}
        </TouchableOpacity>
        <Modal
          transparent={this.props.transparent}
          animationType={this.props.animationType}
          visible={this.state.modalVisible}
          onRequestClose={() => this.setState({ modalVisible: false })}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.header}>
              {this.props.closeable && (
                <CloseButton
                  image={this.props.closeButtonImage}
                  styles={[styles.closeButton, styles.closeButtonImage]}
                  onPress={() => this.onClose()}
                />
              )}
              {this.props.filterable && this.renderFilter()}
            </View>
            <KeyboardAvoidingView behavior="padding">
              <View style={styles.contentContainer}>
                <FlatList
                  testID="list-countries"
                  keyboardShouldPersistTaps="handled"
                  data={this.state.flatListMap}
                  ref={flatList => (this._flatList = flatList)}
                  initialNumToRender={30}
                  onScrollToIndexFailed={()=>{}}
                  renderItem={(region) => this.renderRegion(region.item.key.shortCode)}
                  keyExtractor={(item, index) => index.toString()}
                  getItemLayout={(data, index) => (
                    { length: this.itemHeight, offset: this.itemHeight * index, index }
                  )}
                />
                {!this.props.hideAlphabetFilter && (
                  <ScrollView
                    contentContainerStyle={styles.letters}
                    keyboardShouldPersistTaps="always"
                  >
                    {this.state.filter === '' &&
                      this.state.letters.map((letter, index) =>
                        this.renderLetters(letter, index)
                      )}
                  </ScrollView>
                )}
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
      </View>
    )
  }
}
