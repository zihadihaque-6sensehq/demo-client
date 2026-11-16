import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getContactInitiation } from "@/api/logical";
import { useToast } from "@/context/ToastContext";

export function useContactFlow() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContentRef, setModalContentRef] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const navLock = useRef(false);

  const openModal = useCallback((contentRef: string) => {
    setModalContentRef(contentRef);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalContentRef(null);
  }, []);

  const startContact = useCallback(
    async (options?: { destinationRoute?: string; formId?: string }) => {
      if (pending || navLock.current) {
        return;
      }
      setPending(true);
      try {
        const result = await getContactInitiation(options);
        if (result.redirectUrl) {
          navLock.current = true;
          if (result.redirectUrl.startsWith("http")) {
            window.location.assign(result.redirectUrl);
          } else {
            navigate(result.redirectUrl);
          }
          window.setTimeout(() => {
            navLock.current = false;
          }, 500);
          return;
        }
        if (result.modalContentRef) {
          openModal(result.modalContentRef);
          return;
        }
        openModal("default-contact");
      } catch (err) {
        const message =
          err instanceof Error ?
            err.message
          : "Contact is unavailable right now. Please try again later.";
        showToast(message, "error");
      } finally {
        setPending(false);
      }
    },
    [navigate, openModal, showToast],
  );

  const navigateToRoute = useCallback(
    (path: string) => {
      if (navLock.current) {
        return;
      }
      navLock.current = true;
      navigate(path);
      window.setTimeout(() => {
        navLock.current = false;
      }, 500);
    },
    [navigate],
  );

  return {
    pending,
    modalOpen,
    modalContentRef,
    closeModal,
    startContact,
    navigateToRoute,
    navLock,
  };
}