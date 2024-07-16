import { Button, Space } from 'antd';
import { styled } from 'styled-components';
import { Buttons, PageDivisionBackground } from '../components/themes/color';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from "../config/firebase.config";

const Home: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
          await signOut(auth); 
          navigate('/'); 
        } catch (error) {
          console.error('Error signing out:', error);
        }
    };

    return (
        <DashboardComponent>
            <DashboardNavBar>
                <NavBarHeading>
                    <p>Chat Application</p>
                </NavBarHeading>
                <NavBarItems>
                    <Space>
                        <NavBarDropdownButtonAndModal>
                            <StyledButton type='link' onClick={handleLogout}>Logout</StyledButton>
                        </NavBarDropdownButtonAndModal>
                    </Space>
                </NavBarItems>
            </DashboardNavBar>            
        </DashboardComponent>
    );
};

export default Home;

const DashboardComponent = styled.div`
    height: 97.6vh;
    display: flex;
    flex-direction: column;
`;

const DashboardNavBar = styled.div`
    display: flex;
    background-color: ${PageDivisionBackground.navbarBg};
    padding: 10px;
`;

const NavBarHeading = styled.div`
    margin-right: auto;
`;

const NavBarItems = styled.div`
    display: flex;
`;

const NavBarDropdownButtonAndModal = styled.div``;

const StyledButton = styled(Button)`
    background-color: ${Buttons.backgroundColor};
    color: ${Buttons.text};
    border: none;
    &&&:hover {
        color: ${Buttons.hover};
    }
`;
