import { Helmet } from "react-helmet";
import cns from "classnames";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllCampaigns, deselectCampaign } from "@redux/features/campaign/campaignSlice";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import Loader from "@components/UI/Loader";
import ScrollToTop from "@components/Utils/ScrollToTop";
import stylesAll from "./AllCampaigns.module.scss";
import {
  CAMPAIGNS_PER_PAGE,
  PAGINATION_RANGE_DISPLAYED,
} from "@config/constants";

const colors = {
  active: stylesAll.colorActive,
  pending: stylesAll.colorPending,
  completed: stylesAll.colorCompleted,
  sheduled: stylesAll.colorSheduled,
  archived: stylesAll.colorArchived,
};

const getDaysString = (days) => {
  let daysString = "";
  for (const key in days) {
    if (days[key]) {
      daysString += key + " ";
    }
  }

  return daysString;
};

const getTimeString = (times) => {
  let timesString = "";
  for (let i = 0; i < times.start_times.length; i++) {
    timesString += `${times.start_times[i]} - ${times.end_times[i]} `;
  }

  return timesString;
};

const AllCampaigns = () => {
  const { token } = useSelector((state) => state.auth);
  const {
    statusAllCampaigns,
    campaigns,
    numberOfCampaigns,
  } = useSelector((state) => state.campaign);
  const dispatch = useDispatch();

  const [page, setPage] = useState(0);

  const [pageCount, setPageCount] = useState(
    Math.ceil(numberOfCampaigns / CAMPAIGNS_PER_PAGE)
  );

  useEffect(() => {
    dispatch(getAllCampaigns({ token, page }));
    dispatch(deselectCampaign());
  }, [page, dispatch, token]);

  useEffect(() => {
    setPageCount(Math.ceil(numberOfCampaigns / CAMPAIGNS_PER_PAGE));
  }, [numberOfCampaigns]);

  const handlePageClick = (event) => {
    setPage(event.selected);
  };

  return (
    <>
      <Helmet>
        <title>Campaign Builder - Campaigns</title>
      </Helmet>
      <ScrollToTop initiator={page} />
      <div className={cns("container", stylesAll.container)}>
        <div className={cns(stylesAll.top)}>
          <h1 className={cns("campaignHeading")}>My Campaigns</h1>
          <Link to="/campaigns/new" className={cns("primaryBtn",stylesAll.link)}>
            Create new campaign
          </Link>
        </div>
        {statusAllCampaigns === null ? (
          <Loader />
        ) : (
          <div className={cns("section-container", stylesAll.content)}>
            {campaigns.length === 0 && (
              <p className={cns("bodyText1", "empty")}>
                You have not created any campaign yet
              </p>
            )}
            {campaigns.length > 0 && (
              <div>
                <div className={cns(stylesAll.campaigns)}>
                  {campaigns.map((campaign) => (
                    <Link to={`/campaigns/${campaign.id}`} key={campaign.id} className={cns(stylesAll.campaignContainer)}>
                      <div className={cns(stylesAll.campaign)}>
                        <div className={cns(stylesAll.imageContainer)}>
                          <img
                            src={campaign.imageUrl}
                            alt={campaign.name}
                            className={cns("img")}
                          />
                          <span style={{ color: colors[campaign.status] }}>
                            {campaign.status}
                          </span>
                        </div>
                        <div className={cns(stylesAll.campaignContent)}>
                          <h6 className={cns("campaignSubHeading")}>
                            {campaign.name}
                          </h6>
                          <div className={cns(stylesAll.scheduling)}>
                            <span className={cns("bodyText2")}>
                              {campaign.scheduling.publish_dates_isforever
                                ? "Forever"
                                : `${campaign.scheduling.publish_dates_custom.start_date} - ${campaign.scheduling.publish_dates_custom.end_date}`}
                            </span>{" "}
                            |{" "}
                            <span className={cns("bodyText2")}>
                              {campaign.scheduling.dow_iseveryday
                                ? "Everyday"
                                : getDaysString(campaign.scheduling.dow_custom)}
                            </span>{" "}
                            |{" "}
                            <span className={cns("bodyText2")}>
                              {campaign.scheduling.playtimes_isallday
                                ? "All day"
                                : getTimeString(
                                    campaign.scheduling.playtimes_custom
                                  )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div>
                  <ReactPaginate
                    containerClassName={cns("pagination")}
                    previousLinkClassName={cns(
                      "pagination__link",
                      "pagination__link--prev"
                    )}
                    nextLinkClassName={cns(
                      "pagination__link",
                      "pagination__link--next"
                    )}
                    pageClassName={"pagination__link--page"}
                    breakClassName={cns(
                      "pagination__link--page",
                      "pagination__link--break"
                    )}
                    activeClassName={"pagination__link--active"}
                    breakLabel="..."
                    nextLabel="next &rarr;"
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={PAGINATION_RANGE_DISPLAYED}
                    marginPagesDisplayed={PAGINATION_RANGE_DISPLAYED}
                    pageCount={pageCount}
                    previousLabel="&larr; previous"
                    renderOnZeroPageCount={null}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AllCampaigns;
