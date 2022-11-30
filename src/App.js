import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Link from "@mui/material/Link";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import {
  Link as RouterLink,
  Route,
  Routes,
  MemoryRouter,
  useLocation,
} from "react-router-dom";
import axios from "axios";

export default function App() {
  let lists = [];
  const [root, setRoot] = React.useState([]);

  React.useEffect(() => {
    axios
      .get("https://react-training-e5993-default-rtdb.firebaseio.com/data.json")
      .then(function (response) {
        // handle success
        setRoot(response.data);
      });
  }, []);

  /**
   *
   * @param {*} data root or root.children
   * @param {*} prevKey eg '/home/myname'
   * @param {*} pl paddingLeft
   * @returns eg {'/home': {value : 'home' , pl: '4'}}
   * @example
   */
  const getBreadcrumbNameMap = (data, prevKey = "", pl = 0) => {
    let result = {};
    if (data?.type === "dir") {
      for (const property in data.children) {
        const resultKey = prevKey + "/" + property;
        result[resultKey] = { value: property, pl: pl + 4 };
        result = {
          ...result,
          ...getBreadcrumbNameMap(
            data.children[property],
            prevKey + "/" + property,
            pl + 4
          ),
        };
      }
    }
    return result;
  };

  const breadcrumbNameMap = getBreadcrumbNameMap(root);
  console.log(breadcrumbNameMap);

  function ListItemLink(props) {
    const { to, open, ...other } = props;
    const primary = breadcrumbNameMap[to].value;

    let icon = null;
    if (open != null) {
      icon = open ? <ExpandLess /> : <ExpandMore />;
    }

    return (
      <li>
        <ListItem button component={RouterLink} to={to} {...other}>
          <ListItemText primary={primary} />
          {icon}
        </ListItem>
      </li>
    );
  }

  ListItemLink.propTypes = {
    open: PropTypes.bool,
    to: PropTypes.string.isRequired,
  };

  function LinkRouter(props) {
    return <Link {...props} component={RouterLink} />;
  }

  function Page() {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);

    return (
      <Breadcrumbs aria-label="breadcrumb">
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;

          return last ? (
            <Typography color="text.primary" key={to}>
              {breadcrumbNameMap[to]?.value}
            </Typography>
          ) : (
            <LinkRouter underline="hover" color="inherit" to={to} key={to}>
              {breadcrumbNameMap[to]?.value}
            </LinkRouter>
          );
        })}
      </Breadcrumbs>
    );
  }

  for (const list in breadcrumbNameMap) {
    lists.push(
      <ListItemLink
        key={list}
        to={list}
        sx={{ pl: breadcrumbNameMap[list].pl }}
      />
    );
  }

  return (
    <MemoryRouter initialEntries={["/inbox"]} initialIndex={0}>
      <Box sx={{ display: "flex", flexDirection: "column", width: 360 }}>
        <Routes>
          <Route path="*" element={<Page />} />
        </Routes>
        <Box
          sx={{
            bgcolor: "background.paper",
            mt: 1,
          }}
          component="nav"
          aria-label="mailbox folders"
        >
          <List>{lists}</List>
        </Box>
      </Box>
    </MemoryRouter>
  );
}
