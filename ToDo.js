import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, TextInput } from 'react-native';
import PropTypes from 'prop-types';

const { height, width } = Dimensions.get('window');

export default class ToDo extends Component {
	// const { text } = this.props 를 사용하기보다는
	// 이렇게 사용하는게 더 세련됐다.

	constructor(props) {
		super(props);
		this.state = {
			isEditing: false,
			toDoValue: props.text,
		};
	}

	static propTypes = {
		text: PropTypes.string.isRequired,
		isCompleted: PropTypes.bool.isRequired,
		deleteToDo: PropTypes.func.isRequired,
		id: PropTypes.string.isRequired,
		uncompleteToDo: PropTypes.func.isRequired,
		completeToDo: PropTypes.func.isRequired,
		updateToDo: PropTypes.func.isRequired,
	};

	render() {
		const { isEditing, toDoValue } = this.state;
		const { text, deleteToDo, id, isCompleted } = this.props;
		return (
			<View style={styles.container}>
				<View style={styles.column}>
					<TouchableOpacity onPress={this._toggleComplete}>
						<View
							style={[styles.circle, isCompleted ? styles.completedCircle : styles.uncompletedCircle]}
						/>
					</TouchableOpacity>
					{isEditing ? (
						<TextInput
							value={toDoValue}
							style={[
								styles.text,
								styles.input,
								isCompleted ? styles.completeText : styles.uncompletedText,
							]}
							multiline={true}
							onChangeText={this._controlInput}
							returnKeyType={'done'}
							onBlur={this._finishEditing}
						/>
					) : (
						<Text style={[styles.text, isCompleted ? styles.completeText : styles.uncompletedText]}>
							{text}
						</Text>
					)}
				</View>

				{isEditing ? (
					<View style={styles.actions}>
						<TouchableOpacity
							onPressOut={event => {
								event.stopPropagation;
								this._finishEditing;
							}}
						>
							<View style={styles.actionContainer}>
								<Text style={styles.actionText}>✅</Text>
							</View>
						</TouchableOpacity>
					</View>
				) : (
					<View style={styles.actions}>
						<TouchableOpacity onPressOut={this._startEditing}>
							<View style={styles.actionContainer}>
								<Text style={styles.actionText}> ✏️</Text>
							</View>
						</TouchableOpacity>
						<TouchableOpacity onPressOut={() => deleteToDo(id)}>
							<View style={styles.actionContainer}>
								<Text style={styles.actionText}>❌</Text>
							</View>
						</TouchableOpacity>
					</View>
				)}
			</View>
		);
	}
	//propagation(전파)이벤트 전파
	//1. 버튼, 스크롤뷰 클릭할 때마다 이벤트 전파
	_toggleComplete = event => {
		event.stopPropagation();
		const { isCompleted, uncompleteToDo, completeToDo, id } = this.props;
		if (isCompleted) {
			uncompleteToDo(id);
		} else {
			completeToDo(id);
		}
		// this.setState(prevState => {
		// 	return {
		// 		isCompleted: !prevState.isCompleted,
		// 	};
		// });
	};
	///만약 이전 prevState의 isComplete가 false라면 true가 되고,
	///만약 true 라면 false가 된다.
	_startEditing = event => {
		event.stopPropagation();
		this.setState({
			isEditing: true,
		});
	};
	_finishEditing = event => {
		event.stopPropagation();
		const { toDoValue } = this.state;
		const { id, updateToDo } = this.props;
		updateToDo(id, toDoValue);
		this.setState({
			isEditing: false,
		});
	};
	_controlInput = text => {
		this.setState({
			toDoValue: text,
		});
	};
}

const styles = StyleSheet.create({
	container: {
		width: width - 50,
		borderBottomColor: '#bbb',
		borderBottomWidth: StyleSheet.hairlineWidth,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	circle: {
		width: 30,
		height: 30,
		borderRadius: 15,
		borderWidth: 3,
		marginRight: 20,
	},
	completedCircle: {
		borderColor: '#bbb',
	},
	uncompletedCircle: {
		borderColor: '#f23657',
	},
	text: {
		fontWeight: '600',
		fontSize: 20,
		marginVertical: 20,
	},
	completeText: {
		color: '#bbb',
		textDecorationLine: 'line-through',
	},
	uncompletedText: {
		color: '#353839',
	},
	column: {
		flexDirection: 'row',
		alignItems: 'center',
		width: width / 2,
	},
	actions: {
		flexDirection: 'row',
	},
	actionContainer: {
		marginVertical: 10,
		marginHorizontal: 10,
	},
	input: {
		width: width / 2,
		marginVertical: 15,
		paddingBottom: 5,
		paddingLeft: 6,
	},
});
