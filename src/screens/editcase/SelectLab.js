import React, {Fragment, Component} from 'react';
import {
    YellowBox,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
  Share,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';

import {getInset} from 'react-native-safe-area-view'
const base64 = require('base-64');
import { SkypeIndicator } from 'react-native-indicators';
import Global from '../../utils/Global/Global'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { TextInput } from 'react-native-gesture-handler';
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from 'moment';
import { isTSExpressionWithTypeArguments } from '@babel/types';

YellowBox.ignoreWarnings(["Warning:"]);

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var menu_bar_height = 70;
var safearea_height = deviceHeight - getInset('top') - getInset('bottom');
var main_view_height = Platform.OS == "ios" ? safearea_height - menu_bar_height : safearea_height - menu_bar_height - StatusBar.currentHeight;

export default class SelectLab extends Component {
    static navigationOptions = {
        header: null,
        headerBackTitle: null,
	};

    constructor(props){
		super(props);

		this.state = {

            showIndicator: false,

            prev_screen: props.navigation.state.params.prev_screen,
            lab_list: [],

            search_text: '',
            new_lab_modal_show: false,
            lab_text_name: '',
            lab_loinc_code: '',
            lab_cpt_code: '',
            
		}
    }

    async UNSAFE_componentWillMount() {
        
    }

    go_back() {
        if(this.state.prev_screen == "LabTests") {
            this.props.navigation.navigate("LabTests");
        } else if(this.state.prev_screen == "RequiredLabs") {
            this.props.navigation.navigate("RequiredLabs");
        } else if(this.state.prev_screen == "LabMaster") {
            this.props.navigation.navigate("LabMaster");
        } 
    }

    select_lab(item) {
        if(this.state.prev_screen == "LabTests") {
            item.labStatus = "O";
            Global.edit_case_json.labs.push(item);
            this.props.navigation.navigate("LabTests");
        } else if(this.state.prev_screen == "RequiredLabs") {
            item.labStatus = "O";
            item.userName = Global.profile_user_name;
            item.visitNumber = 0;
            Global.icd_admin_json.labs.push(item);
            this.props.navigation.navigate("RequiredLabs");
        } else if(this.state.prev_screen == "LabMaster") {
            Global.lab_admin_json.bestAlias = item.bestAlias;
            Global.lab_admin_json.id = item.id;
            Global.lab_admin_json.labAlias = item.labAlias;
            Global.lab_admin_json.labCode = item.labCode;
            Global.lab_admin_json.labDesc = item.labDesc;
            Global.lab_admin_json.loincCode = item.loincCode;
            Global.lab_admin_json.userName = Global.profile_user_name;

            this.props.navigation.navigate("LabMaster");
        } 
    }

    search_lab = async() => {
        Keyboard.dismiss();
        if(this.state.search_text < 2) {
            Alert.alert("Warning!", "Minimum criteria length is 2 characters.");
            return;
        }
        this.setState({showIndicator: true})
        await fetch(Global.base_url + '/labref?query=' + this.state.search_text, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            }
        })
        .then(response => response.json())
        .then(async data => {
            this.setState({
                lab_list: data,
            });
        })
        .catch(function(error) {
            Alert.alert('Warning!', error.message);
        });
        this.setState({showIndicator: false})

    }

    add_new_lab = async() => {
        if(this.state.lab_text_name == "" || this.state.lab_loinc_code == "") {
            Alert.alert("Warning!", "Please fill all fields.");
            return;
        }
        var new_lab = {
            "labDesc": this.state.lab_text_name,
            "loincCode": this.state.lab_loinc_code,
            "labCode": this.state.lab_cpt_code
        };
        this.setState({showIndicator: true})
        await fetch(Global.base_url + '/labref', {
            method: "POST",
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': 'Basic ' + base64.encode(Global.user_name + ":" + Global.password)
            },
            body: JSON.stringify(new_lab)
        })
        .then(response => {
            const status_code = response.status;
            if(status_code == 409) {
                return {'error': 409};
            } else {
                return data = response.json();
            } 
        })
        .then(async data => {
            if(data.error == 409) {
                Alert.alert("Warning!", "Symptom already exist.");
            } else {
                var lab_list = this.state.lab_list;
                lab_list.push(new_lab);
                this.setState({
                    lab_list: lab_list,
                    new_lab_modal_show: false,
                    lab_text_name: "",
                    lab_loinc_code: ""
                })
            }
        })
        .catch(function(error) {
            Alert.alert('Warning!', "Netework error");
        });
        this.setState({showIndicator: false})
    }

    render() {
        return (
        <SafeAreaView style = {styles.container}>
        {
            this.state.showIndicator &&
            <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.3, zIndex: 150}}>
                <View style = {{flex: 1}}>
                    <SkypeIndicator color = '#ffffff' />
                </View>
            </View>
        }
            <View style = {styles.menu_bar}>
                <View style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity onPress = {() => this.go_back()}>
                        <Image style = {{width: 20, height: 20}} resizeMode = {'contain'} source={require('../../assets/images/menu_back_arrow.png')}/>
                    </TouchableOpacity>
                </View>
                <View style = {{width: '80%', height: '100%', justifyContent: 'center'}}>
                    <Text style = {{fontSize: 18, color: '#ffffff'}}>Select Lab</Text>
                </View>

            </View>
            <View style = {{width: '100%', height: main_view_height, alignItems: 'center'}}>
                <View style = {{width: '95%', height: 40, borderColor: '#000000', borderWidth: 1, flexDirection: 'row', marginTop: 10}}>
                    <View style = {{width: '80%', height: '100%'}}>
                        <TextInput style = {styles.search_input_text} placeholder = {'Search Lab'} returnKeyType = {'search'} onSubmitEditing = {() => this.search_lab()} onChangeText = {(text) => this.setState({search_text: text})}></TextInput>
                    </View>
                    <TouchableOpacity style = {{width: '20%', height: '100%', justifyContent: 'center', alignItems: 'flex-end'}} onPress = {() => this.search_lab()}>
                        <Image style = {{width: 20, height: 20, marginRight: 10}} resizeMode = {'contain'} source={require('../../assets/images/search_icon.png')}/>
                    </TouchableOpacity>
                </View>
                <View style = {{width: '95%', height: main_view_height - 40 - 10}}>
                    <ScrollView style = {{width: '100%'}} showsVerticalScrollIndicator = {false}>
                    {
                        this.state.lab_list.map((item, index) => 
                        <TouchableOpacity key = {index} style = {styles.component_view} onPress = {() => this.select_lab(item)}>
                            <Text style = {styles.component_content_text}>{item.labDesc}(Alias:{item.labAlias})(LOINC:{item.loincCode})(CPT:{item.labCode})</Text>
                        </TouchableOpacity>
                        )
                    }
                    </ScrollView>
                </View>
                <TouchableOpacity style = {{width: 40, height: 40, position: 'absolute', right: 10, bottom: 10}} onPress = {() => this.setState({new_lab_modal_show: true})}>
                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source={require('../../assets/images/new_case_add.png')}/>
                </TouchableOpacity>
            </View>
            {
                this.state.new_lab_modal_show &&
                <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.3, zIndex: 50}}/>
            }
            {
                this.state.new_lab_modal_show &&
                <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 100}}>
                    <View style = {{width: '80%', height: 370, alignItems: 'center', backgroundColor: '#ffffff'}}>
                        <View style = {{width: '100%', height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#445774'}}>
                            <Text style = {[styles.component_content_text, {color: '#ffffff'}]}>Create New Lab Text</Text>
                        </View>
                        <View style = {{width: '100%', height: 30, justifyContent: 'center', marginLeft: 10}}>
                            <Text style = {styles.component_content_text}>Enter Lab Test Name</Text>
                        </View>
                        <View style = {{width: '95%', height: 40, borderColor: '#000000', borderWidth: 1, justifyContent: 'center'}}>
                            <TextInput style = {[styles.component_content_text, {padding: 0}]} onChangeText = {(text) => this.setState({lab_text_name: text})}>{this.state.lab_text_name}</TextInput>
                        </View>
                        <View style = {{width: '100%', height: 30, justifyContent: 'center', marginLeft: 10}}>
                            <Text style = {styles.component_content_text}>Enter Lab Loinc code</Text>
                        </View>
                        <View style = {{width: '95%', height: 40, borderColor: '#000000', borderWidth: 1, justifyContent: 'center'}}>
                            <TextInput style = {[styles.component_content_text, {padding: 0}]} onChangeText = {(text) => this.setState({lab_loinc_code: text})}>{this.state.lab_loinc_code}</TextInput>
                        </View>
                        <View style = {{width: '100%', height: 30, justifyContent: 'center', marginLeft: 10}}>
                            <Text style = {styles.component_content_text}>Enter Lab CPT code</Text>
                        </View>
                        <View style = {{width: '95%', height: 40, borderColor: '#000000', borderWidth: 1, justifyContent: 'center'}}>
                            <TextInput style = {[styles.component_content_text, {padding: 0}]} onChangeText = {(text) => this.setState({lab_cpt_code: text})}>{this.state.lab_cpt_code}</TextInput>
                        </View>
                        <View style = {{width: '95%', height: 110, justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row'}}>
                            <TouchableOpacity style = {{width: '45%', height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#445774'}} onPress = {() => this.setState({new_lab_modal_show: false})}>
                                <Text style = {[styles.component_content_text, {color: '#ffffff'}]}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style = {{width: '45%', height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#445774'}} onPress = {() => this.add_new_lab()}>
                                <Text style = {[styles.component_content_text, {color: '#ffffff'}]}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            }
            
        </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
        // alignItems: 'center'
    },
    menu_bar: {
        width: '100%',
        height: menu_bar_height,
        backgroundColor: '#445774',
        flexDirection: 'row'
    },
    search_input_text: {
        width: '100%',
        height: '100%',
        padding: 0,
        paddingLeft: 10
    },
    component_view: {
        width: '100%',
        // height: 40,
        justifyContent: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        marginTop: 15
    },
    component_content_text: {
        fontSize: 16,
        color: '#000000'
    }
})