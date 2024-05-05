import React, { useEffect, useState } from "react";
import {
  Grid,
  makeStyles,
  Container,
  CircularProgress,
  Typography,
} from "@material-ui/core";
import "./App.css";
import Filter from "./components/Filter";
import JobCard from "./components/JobCard";
import InfiniteScroll from "./components/InfiniteScroll";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  progress: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(10),
  },
  noJobsMessage: {
    marginTop: theme.spacing(10),
    fontStyle: "italic",
    color: "#666",
  },
}));

function App() {
  const classes = useStyles();
  const [jobs, setJobs] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filteredJobs, setFilteredJobs] = useState([]);

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    limit: 12,
    offset: offset,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      await fetch(
        "https://api.weekday.technology/adhoc/getSampleJdJSON",
        requestOptions
      )
        .then((response) => response.json())
        .then((result) => {
          setJobs((prevJobs) => [...prevJobs, ...result.jdList]);
          // Initialize filtered jobs with all jobs
          setFilteredJobs((prevJobs) => [...prevJobs, ...result.jdList]);
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          console.log("error", error);
        });
    } catch (error) {
      console.error("Error fetching job listings:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [offset]);

  const loadMoreJobs = () => {
    if (!loading) {
      setOffset((prevOffset) => prevOffset + 10);
    }
  };

  const filterJobs = (filters) => {
    // Apply filters to the original jobs list
    let filteredList = jobs.filter((job) => {
      // Filter by min experience
      if (filters.minExp && job.minExp < filters.minExp) {
        return false;
      }
      // Filter by company name
      if (
        filters.companyName &&
        !job.companyName
          .toLowerCase()
          .includes(filters.companyName.toLowerCase())
      ) {
        return false;
      }
      // Filter by location
      if (filters.remote.length > 0) {
        // Check if both "Remote" and "On-site" are selected
        if (
          filters.remote.includes("remote") &&
          filters.remote.includes("on-site")
        ) {
          return true; // Show all jobs
        } else if (filters.remote.includes("remote")) {
          // Filter remote jobs
          if (!job.location.toLowerCase().includes("remote")) {
            return false;
          }
        } else if (filters.remote.includes("on-site")) {
          // Filter on-site jobs
          if (job.location.toLowerCase().includes("remote")) {
            return false;
          }
        }
      }
      // Filter by tech stack
      if (
        filters.techStack.length > 0 &&
        !filters.techStack.includes(job.techStack)
      ) {
        return false;
      }
      // Filter by job role
      if (
        filters.jobRole.length > 0 &&
        !filters.jobRole.includes(job.jobRole)
      ) {
        return false;
      }
      // Filter by min JD salary
      if (filters.minJdSalary && job.minJdSalary < filters.minJdSalary) {
        return false;
      }
      return true; // Job passes all filter conditions
    });

    // Update the filtered jobs state
    setFilteredJobs(filteredList);
  };

  return (
    <div className="App">
      <Container maxWidth="lg" className={classes.container}>
        <Filter filterJobs={filterJobs} />
        {filteredJobs.length === 0 && !loading && (
          <Typography
            variant="h6"
            align="center"
            className={classes.noJobsMessage}
          >
            No jobs found matching the selected criteria.
            <br />
            Please try different filters.
          </Typography>
        )}
        <Grid container spacing={3}>
          {filteredJobs.map((job, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <JobCard job={job} />
            </Grid>
          ))}
        </Grid>
      </Container>
      <InfiniteScroll onScroll={loadMoreJobs} />
      {loading && (
        <div className={classes.progress}>
          <CircularProgress />
        </div>
      )}
    </div>
  );
}

export default App;
