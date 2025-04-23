// styles/AddGroup.styles.ts

import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  groupImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'cover',
  },
  defaultImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#C9A84F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#FFD700',
    borderRadius: 14,
    padding: 4,
  },
  groupNameInput: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 30,
    textAlign: 'center',
  },

  // ↓↓↓ These are the important updates ↓↓↓
  settingRow: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 12,
    gap: 10,
  },
  settingLabel: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    width: 130,
    textAlign: 'right',
    paddingRight: 10,
    paddingTop: 4, // adjust this for fine-tuning label alignment
  },
  settingInputWrapper: {
    flex: 1,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#111',
    alignSelf: 'flex-start', // aligns to left instead of stretching
  },
  dropdownText: {
    color: '#FFD700',
    fontSize: 16,
    marginRight: 6,
  },
  menuContent: {
    backgroundColor: '#222',
  },
  menuItem: {
    color: '#FFD700',
  },
  fairnessToggleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  toggleButton: {
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#333',
  },
  toggleInactive: {
    backgroundColor: '#222',
  },
  toggleText: {
    fontSize: 14,
  },
  toggleTextActive: {
    color: '#FFD700',
  },
  toggleTextInactive: {
    color: '#777',
  },
});
