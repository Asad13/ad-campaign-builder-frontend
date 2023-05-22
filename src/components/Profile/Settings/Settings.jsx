import { Helmet } from "react-helmet";
import cns from "classnames";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsers,
  getRoles,
  updateUserRole,
  deleteUser,
  inviteUser,
  resendInvite,
  updateStatusDeleteUser,
  updateMessageDeleteUser,
  updateMessageUpdateUserRole,
  updateStatusUpdateUserRole,
  updateMessageSendInvite,
  updateStatusSendInvite,
  updateMessageResendInvite,
  updateStatusResendInvite,
} from "@redux/features/user/userSlice";
import { ToastContainer, toast } from "react-toastify";
import Select from "react-select";
import styles from "../Profile.module.scss";
import stylesSettings from "./Settings.module.scss";
import allUsers from "@assets/data/users";
import ReactPaginate from "react-paginate";
import Loader from "@components/UI/Loader";
import {
  SearchIcon,
  EditIcon,
  TrashIcon,
  ResendIcon,
  PlusIcon,
} from "@assets/images/misc";
import { DeleteUserModal, EditUserRoleModal, InviteUserModal } from "./modals";
import {
  TOAST_AUTO_CLOSE_DURATION,
  TOAST_OPTIONS,
  EXT_LINK_HOW_TO_INVITE_GUEST,
  USERS_PER_PAGE,
  PAGINATION_RANGE_DISPLAYED,
} from "@config/constants";

function getRole(roles, role_id) {
  if (!roles || !role_id) {
    return "";
  }

  return roles.find((role) => role.id === role_id)?.name ?? "";
}

const Settings = () => {
  const { user, token } = useSelector((state) => state.auth);
  const {
    users,
    roles,
    numberOfUsers,
    statusAllUsers,
    statusDeleteUser,
    messageDeleteUser,
    statusSendInvite,
    messageSendInvite,
    statusResendInvite,
    messageResendInvite,
    statusUpdateUserRole,
    messageUpdateUserRole,
  } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [status, setStatus] = useState(allUsers[0]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [deleteUserId, setDeleteUserId] = useState(null);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);

  const [showInviteUserModal, setShowInviteUserModal] = useState(false);

  const [editUserRole_UserId, setEditUserRole_UserId] = useState(null);
  const [editUserRole_RoleId, setEditUserRole_RoleId] = useState(null);
  const [showEditUserRoleModal, setShowEditUserRoleModal] = useState(false);

  const [pageCount, setPageCount] = useState(
    Math.ceil(numberOfUsers / USERS_PER_PAGE)
  );

  const toastId = useRef(null);
  const notify = (message, type = "success") => {
    if (type === "success") {
      return (toastId.current = toast.success(message, TOAST_OPTIONS));
    } else {
      return (toastId.current = toast.error(message, TOAST_OPTIONS));
    }
  };

  useEffect(() => {
    if (statusSendInvite) {
      notify(messageSendInvite);
    } else if (statusSendInvite === false) {
      notify(messageSendInvite, "error");
    }
    dispatch(updateStatusSendInvite());
    dispatch(updateMessageSendInvite());
  }, [statusSendInvite]);

  useEffect(() => {
    if (statusResendInvite) {
      notify(messageResendInvite);
    } else if (statusResendInvite === false) {
      notify(messageResendInvite, "error");
    }
    dispatch(updateStatusResendInvite());
    dispatch(updateMessageResendInvite());
  }, [statusResendInvite]);

  useEffect(() => {
    if (statusUpdateUserRole) {
      notify(messageUpdateUserRole);
    } else if (statusUpdateUserRole === false) {
      notify(messageUpdateUserRole, "error");
    }
    dispatch(updateStatusUpdateUserRole());
    dispatch(updateMessageUpdateUserRole());
  }, [statusUpdateUserRole]);

  const constructPath = () => {
    let path = "?";
    /* Not needed right now. Will be needed when search member dropdown will be added */
    // if (status?.value !== "0") {
    //   path += `status=${status?.label.toLowerCase()}&`;
    // } else {
    //   path += `status=all&`;
    // }

    // if (search) {
    //   path += `search=${search}&`;
    // }

    path += `page=${page}`;

    return path;
  };

  useEffect(() => {
    if (!roles || roles.length === 0) {
      dispatch(getRoles({ token }));
    }
  }, []);

  useEffect(() => {
    const path = constructPath();
    dispatch(getAllUsers({ token, path }));
  }, [page]); // [status, search, page] - Will be needed when search member dropdown will be added

  useEffect(() => {
    setPageCount(Math.ceil(numberOfUsers / USERS_PER_PAGE));
  }, [numberOfUsers]);

  const handlePageClick = (event) => {
    setPage(event.selected);
  };

  useEffect(() => {
    if (statusDeleteUser) {
      notify(messageDeleteUser);
    } else if (statusDeleteUser === false) {
      notify(messageDeleteUser, "error");
    }
    dispatch(updateStatusDeleteUser());
    dispatch(updateMessageDeleteUser());
    if(users.length === 0 && page > 1){
      setPage(page => page - 1);
    }
    const path = constructPath();
    dispatch(getAllUsers({ token, path }));
  }, [statusDeleteUser]);

  const confirmDeleteUser = useCallback((id) => {
    dispatch(deleteUser({ token, id }));
  }, []);

  const isDeleteUser = useCallback((id) => {
    setDeleteUserId(id);
    setShowDeleteUserModal(true);
  }, []);

  const confirmUpdateUserRole = useCallback((id, role_id) => {
    const data = { role_id: role_id };
    dispatch(updateUserRole({ data, token, id }));
  }, []);

  const handleInvite = useCallback((event) => {
    setShowInviteUserModal(true);
  }, []);

  const sendInvite = useCallback((data) => {
    dispatch(inviteUser({ data, token }));
  }, []);

  const resendUserInvite = useCallback((id) => {
    const data = { id: id };
    dispatch(resendInvite({ data, token }));
  }, []);

  return (
    <>
      <Helmet>
        <title>Campaign Builder - Settings</title>
      </Helmet>
      {showDeleteUserModal && (
        <DeleteUserModal
          setShowModal={setShowDeleteUserModal}
          id={deleteUserId}
          setDeleteUserId={setDeleteUserId}
          confirmDeleteUser={confirmDeleteUser}
        />
      )}
      {showInviteUserModal && (
        <InviteUserModal
          setShowModal={setShowInviteUserModal}
          roles={roles}
          sendInvite={sendInvite}
        />
      )}
      <div className={cns(styles.container)}>
        <ToastContainer
          position="top-right"
          autoClose={TOAST_AUTO_CLOSE_DURATION}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <h4 className={cns("heading4")}>Admin Settings</h4>
        <div className={cns(stylesSettings.topContainer)}>
          <div className={cns(stylesSettings.searchContainer)}>
            <span className={cns(stylesSettings.searchIcon)}>
              <SearchIcon />
            </span>
            <input
              type="search"
              value={search}
              placeholder="search by name or email"
              name="search"
              id="search"
              className={cns("input", "bodyText2")}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
            />
          </div>
          <div className={cns(stylesSettings.inviteContainer)}>
            <div>
              <Select
                className={cns(stylesSettings.select)}
                placeholder="Choose User"
                getValue={() => status.value}
                value={status}
                name="status"
                id="status"
                onChange={(event) => {
                  setStatus(event);
                }}
                options={allUsers}
                theme={(theme) => ({
                  ...theme,
                  borderRadius: "8px",
                  colors: {
                    ...theme.colors,
                    primary: "#B69538",
                  },
                })}
                styles={{
                  control: (css, state) => ({
                    ...css,
                    backgroundColor: "#f1f1f1",
                    width: "120px",
                    border: "1px solid transparent",
                    paddingTop: "2px",
                    paddingBottom: "2px",
                    cursor: "pointer",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "#515151 !important",
                    fontWeight: "450 !important",
                  }),
                }}
              />
              <button
                type="button"
                className={cns("buttonText", "formBtn")}
                onClick={handleInvite}
              >
                invite
              </button>
            </div>
            <div className={cns(stylesSettings.howToInviteContainer)}>
              <a
                href={EXT_LINK_HOW_TO_INVITE_GUEST}
                className={cns("extLink")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>How to invite a guest</span>
              </a>
            </div>
          </div>
        </div>
        {statusAllUsers === null ? (
          <Loader />
        ) : (
          <div
            className={cns(
              "section-container",
              stylesSettings.contentContainer
            )}
          >
            {numberOfUsers === 0 && (
              <p className={cns("bodyText1", "empty")}>No Users</p>
            )}
            {numberOfUsers > 0 && (
              <div>
                <div className={cns(stylesSettings.users)}>
                  <div className={cns(styles.item, stylesSettings.userRows)}>
                    <div>
                      <h6 className={cns("bodyText2")}>User</h6>
                    </div>
                    <div></div>
                    <div>
                      <h6 className={cns("bodyText2")}>Email</h6>
                    </div>
                    <div>
                      <h6 className={cns("bodyText2")}>Role</h6>
                    </div>
                  </div>
                  {users.length > 0 &&
                    users.map((item) => (
                      <div
                        className={cns(styles.item, stylesSettings.userRows)}
                        key={item?.id}
                      >
                        <div>
                          <p className={cns("bodyText2")}>
                            <span className={cns(stylesSettings.icon)}>AC</span>
                            <span className={cns(stylesSettings.name)}>
                              {item?.name ? item?.name : "No Name"}
                            </span>
                          </p>
                        </div>
                        {!item.status ? (
                          <div
                            className={cns(
                              "bodyText2",
                              stylesSettings.statusContainer
                            )}
                          >
                            <span className={cns(stylesSettings.status)}>
                              PENDING
                            </span>
                            <button
                              type="button"
                              className={cns("textWithIcon")}
                              onClick={(event) => {
                                event.preventDefault();
                                resendUserInvite(item?.id);
                              }}
                            >
                              <span>
                                <ResendIcon />
                              </span>
                              <span>RESEND</span>
                            </button>
                          </div>
                        ) : (
                          <div></div>
                        )}
                        <div>
                          <p className={cns("bodyText2")}>{item?.email}</p>
                        </div>
                        <div
                          className={cns(
                            "bodyText2",
                            stylesSettings.roleContainer
                          )}
                        >
                          <div
                            className={cns(stylesSettings.roleNameContainer)}
                          >
                            <span className={cns(stylesSettings.role)}>
                              {getRole(roles, item?.role_id)}
                            </span>
                            {showEditUserRoleModal &&
                              editUserRole_UserId === item?.id && (
                                <EditUserRoleModal
                                  showModal={showEditUserRoleModal}
                                  setShowModal={setShowEditUserRoleModal}
                                  id={editUserRole_UserId}
                                  roles={roles}
                                  role_id={editUserRole_RoleId}
                                  setEditUserRole_UserId={
                                    setEditUserRole_UserId
                                  }
                                  setEditUserRole_RoleId={
                                    setEditUserRole_RoleId
                                  }
                                  confirmUpdateUserRole={confirmUpdateUserRole}
                                />
                              )}
                          </div>
                          {item?.id !== user.id ? (
                            <div className={cns(stylesSettings.roleBtns)}>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.preventDefault();
                                  setEditUserRole_UserId(item?.id);
                                  setEditUserRole_RoleId(item?.role_id);
                                  setShowEditUserRoleModal(
                                    !showEditUserRoleModal
                                  );
                                }}
                              >
                                <span>
                                  <EditIcon />
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.preventDefault();
                                  isDeleteUser(item?.id);
                                }}
                              >
                                <span>
                                  <TrashIcon />
                                </span>
                              </button>
                            </div>
                          ) : (
                            <span>{"(You)"}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  <div className={cns(styles.item)}>
                    <button
                      type="button"
                      className={cns(stylesSettings.inviteBottomBtn)}
                      onClick={handleInvite}
                    >
                      <span
                        className={cns(
                          stylesSettings.icon,
                          stylesSettings.inviteBottomPlus
                        )}
                      >
                        <span>
                          <PlusIcon />
                        </span>
                      </span>
                      <span
                        className={cns(
                          "bodyText2",
                          stylesSettings.inviteBottomText
                        )}
                      >
                        Invite User
                      </span>
                    </button>
                  </div>
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

export default Settings;
