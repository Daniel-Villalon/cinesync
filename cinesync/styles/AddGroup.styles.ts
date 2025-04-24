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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 12,
    gap: 0,
  },
  settingLabel: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'left',
    paddingRight: 8,
    paddingTop: 2,
  },
  settingInputWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 0,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  
  dropdownText: {
    color: '#F5CB5C',
    fontWeight: '600',
    fontSize: 16,
  },
  
  dropdownMenu: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    color: '#8E8E93',
    fontSize: 16,
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
});
