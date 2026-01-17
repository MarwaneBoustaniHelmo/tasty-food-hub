/**
 * Skip to main content link for keyboard accessibility (WCAG 2.1 AA)
 * This allows keyboard users to skip navigation and go directly to main content
 */
const SkipToContent = () => {
  return (
    <a
      href="#main-content"
      className="skip-link"
      tabIndex={0}
    >
      Aller au contenu principal
    </a>
  );
};

export default SkipToContent;
