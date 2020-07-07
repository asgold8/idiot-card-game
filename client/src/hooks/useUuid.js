import { v4 as uuid } from 'uuid';
import useLocalStorage from './useLocalStorage';

//generate unique user id and store in local storage
const useUuid = () => {
  const [userId] = useLocalStorage('uuid',uuid());
  return userId;
};

export default useUuid;