import AsyncStorage from "@react-native-async-storage/async-storage"

/**
 *
 * @param {string} key
 * @param {object} value
 */
export async function setObjectData(key, value) {
	// try {
		const jsonValue = JSON.stringify(value)
		return await AsyncStorage.setItem(key, jsonValue)
	// } catch (error) {
	// 	throw error
	// }
}

/**
 *
 * @param {string} key
 * @returns {object || null}
 */
export async function getObjectData(key) {
	return AsyncStorage.getItem(key)
		.then(jsonValue => {
			return jsonValue != null ? JSON.parse(jsonValue) : null
		})
		.catch(error => {
			throw error
		})
}

/**
 *
 * @param {string} key
 * @returns {null}
 */
export async function removeObjectData(key) {
	try {
		AsyncStorage.removeItem(key)
	} catch (error) {
		return
	}
}

export const ASYNC_STORAGE_KEYS = {
	LAST_DATE_SCRAPING: "LAST_DATE_SCRAPING", //Value in milliseconds for the last sms scraping date
	USER_IS_JUDGE: "USER_IS_JUDGE"
}
