import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	StatusBar,
	TextInput,
	Dimensions,
	Platform,
	ScrollView,
	AsyncStorage,
} from 'react-native';
import { AppLoading } from 'expo';
import ToDo from './ToDo';
import uuidv1 from 'uuid';

const { height, width } = Dimensions.get('window');

export default class App extends React.Component {
	state = {
		newToDo: '',
		loadedToDos: false,
		toDos: {},
	};

	componentDidMount = () => {
		this._loadToDos();
	};

	render() {
		const { newToDo, loadedToDos, toDos } = this.state;
		//console.log(toDos);
		if (!loadedToDos) {
			return <AppLoading />;
		}
		return (
			<View style={styles.container}>
				<StatusBar barStyle="light-content" />
				<Text style={styles.title}>Kawai To Do</Text>
				<View style={styles.card}>
					<TextInput
						style={styles.input}
						placeholder={'New To Do'}
						value={newToDo}
						onChangeText={this._controlNewToDo}
						placeholderTextColor={'#999'}
						returnKeyType={'done'}
						autoCorrect={false}
						onSubmitEditing={this._addToDo}
					/>
					<ScrollView contentContainerStyle={styles.toDos}>
						{Object.values(toDos)
							.reverse()
							.map(toDo => (
								<ToDo
									key={toDo.id}
									deleteToDo={this._deleteToDo}
									uncompleteToDo={this._uncompleteToDo}
									completeToDo={this._completeToDo}
									updateToDo={this._updateToDo}
									{...toDo}
								/>
							))}
					</ScrollView>
				</View>
			</View>
		);
	}

	//여기나오는 text 인자가 어떻게 내가 쓰는 text가 될 수 있는 지가 궁금.
	_controlNewToDo = text => {
		this.setState({
			newToDo: text,
		});
	};

	_loadToDos = async () => {
		try {
			// AsyncStorage: 로컬스토리지로 핸드폰의 디스크에 저장!
			const toDos = await AsyncStorage.getItem('toDos');
			const parsedToDos = JSON.parse(toDos);
			this.setState({
				loadedToDos: true,
				toDos: parsedToDos || {},
			});
		} catch (err) {
			console.log(err);
		}
	};

	_addToDo = () => {
		const { newToDo } = this.state;
		if (newToDo !== '') {
			// this.setState({
			// 	newToDo: '',
			// });
			// object에 text => newToDo로 들어갈 것이기 때문에

			// 여기서 새로운 리스트를 넣는다고 교체되지 않는다. 추가되도록 만들기
			//toDos: prevState + newState
			this.setState(prevState => {
				const ID = uuidv1();
				const newToDoObject = {
					[ID]: {
						id: ID,
						isCompleted: false,
						text: newToDo,
						createAt: Date.now(),
					},
				};
				const newState = {
					...prevState,
					newToDo: '',
					toDos: {
						...prevState.toDos,
						...newToDoObject,
					},
				};
				this._saveToDos(newState.toDos);
				return { ...newState };
			});
		}
	};

	/// 지금 우리는 여기에다 object 형식으로 할 일을 넣어줄건데,
	/// 우리가 array 형식이 아닌 object 형식으로 넣어주는 이유는
	/// ToDoList는 자주 삭제가 되는데, object 형식으로 만들어주면 그에 대한 id를 찾아서
	/// 한꺼번에 삭제해줘도 되기때문에 이게 array로 되어있으면 지우는데 더 어렵다.

	_deleteToDo = id => {
		this.setState(prevState => {
			const toDos = prevState.toDos;
			delete toDos[id];
			const newState = {
				...prevState,
				...toDos,
			};
			this._saveToDos(newState.toDos);
			return { ...newState };
		});
	};

	_uncompleteToDo = id => {
		this.setState(prevState => {
			const newState = {
				...prevState,
				toDos: {
					...prevState.toDos,
					[id]: {
						...prevState.toDos[id],
						isCompleted: false,
					},
				},
			};
			this._saveToDos(newState.toDos);
			return { ...newState };
		});
	};

	///toDos 에 이전에 있는 prevState 를 그 이전거로 추가하고
	///지금 내가 쓰는 항목을 prevState에 저장한다.

	_completeToDo = id => {
		this.setState(prevState => {
			const newState = {
				...prevState,
				toDos: {
					...prevState.toDos,
					[id]: {
						...prevState.toDos[id],
						isCompleted: true,
					},
				},
			};
			this._saveToDos(newState.toDos);
			return { ...newState };
		});
	};

	_updateToDo = (id, text) => {
		this.setState(prevState => {
			const newState = {
				...prevState,
				toDos: {
					...prevState.toDos,
					[id]: {
						...prevState.toDos[id],
						text: text,
					},
				},
			};
			this._saveToDos(newState.toDos);
			return { ...newState };
		});
	};

	_saveToDos = newToDos => {
		//console.log(JSON.stringify(newToDos));
		const saveToDos = AsyncStorage.setItem('toDos', JSON.stringify(newToDos));
	};
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f23657',
		alignItems: 'center',
	},
	title: {
		color: '#fff',
		fontSize: 30,
		marginTop: 50,
		fontWeight: '200',
		marginBottom: 30,
	},
	card: {
		backgroundColor: 'white',
		flex: 1,
		width: width - 25,
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		...Platform.select({
			ios: {
				shadowColor: 'rgb(50, 50, 50)',
				shadowOpacity: 0.5,
				shadowRadius: 5,
				shadowOffset: {
					height: -1,
					width: 0,
				},
			},
			android: {
				elevation: 3,
			},
		}),
	},
	input: {
		padding: 20,
		borderBottomColor: '#bbb',
		borderBottomWidth: 1,
		fontSize: 25,
	},
	toDos: {
		alignItems: 'center',
	},
});
